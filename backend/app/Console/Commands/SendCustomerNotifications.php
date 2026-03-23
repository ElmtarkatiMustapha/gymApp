<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subscription;
use App\Models\Customer;
use App\Mail\NotificationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendCustomerNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    /**
     * The console command description.
     *
     * @var string
     */
    protected $signature = 'app:send-customer-notifications';

    protected $description = 'Daily automated customer notifications for pre-expiration and expiration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $path = resource_path('js/settings.json');
        if (!File::exists($path)) {
            $this->error("Settings file not found");
            return;
        }
        $settings = json_decode(File::get($path), true);

        if (!($settings['alertSettings']['autoNotice'] ?? false)) {
            $this->info("Auto-notice is disabled in settings.");
            return;
        }

        $this->configureSMTP($settings);

        $daysBefore = (int) ($settings['alertSettings']['days_before_expiration'] ?? 7);
        $maxPreExpireTimes = (int) ($settings['alertSettings']['pre_expire_times'] ?? 2);
        $maxExpireTimes = (int) ($settings['alertSettings']['expire_times'] ?? 2);
        $daysBetween = (int) ($settings['alertSettings']['days_between_alerts'] ?? 2);
        
        Customer::where('state', 1)
            ->with(['subscriptions' => function($q) {
                $q->orderBy('start_at', 'desc');
            }, 'subscriptions.plan'])
            ->chunkById(100, function ($customers) use ($settings, $daysBefore, $maxPreExpireTimes, $maxExpireTimes, $daysBetween) {
                foreach ($customers as $customer) {
                    $subscription = $customer->subscriptions->first();
                    if (!$subscription || !$customer->email) continue;

                    $now = Carbon::now();
                    $lastNotified = $subscription->last_notified_at ? Carbon::parse($subscription->last_notified_at) : null;

                    // Respect days_between_alerts
                    if ($lastNotified && $now->diffInDays($lastNotified) < $daysBetween) {
                        continue;
                    }

                    $expireAt = Carbon::parse($subscription->expire_at);
                    $planName = $subscription->plan->title ?? 'N/A';
                    $expiryDateStr = $expireAt->format('d-m-Y');

                    if ($expireAt->isFuture() && $now->diffInDays($expireAt) <= $daysBefore) {
                        // Pre-expire logic
                        if ($subscription->pre_notice_times < $maxPreExpireTimes) {
                            $this->sendMail($customer, $subscription, 'preExpiration', $settings, $planName, $expiryDateStr);
                            $subscription->increment('pre_notice_times');
                            $subscription->increment('notice_times');
                            $subscription->update(['last_notified_at' => $now]);
                        }
                    } elseif ($expireAt->isPast()) {
                        // Expired logic
                        if ($subscription->expire_notice_times < $maxExpireTimes) {
                            $this->sendMail($customer, $subscription, 'expiration', $settings, $planName, $expiryDateStr);
                            $subscription->increment('expire_notice_times');
                            $subscription->increment('notice_times');
                            $subscription->update(['last_notified_at' => $now]);
                        }
                    }
                }
            });

        $this->info("Automated notifications processed.");
    }

    private function configureSMTP($settings)
    {
        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'host' => $settings["emailSettings"]['host'] ?? '',
            'port' => $settings["emailSettings"]['port'] ?? 587,
            'encryption' => 'tls',
            'username' => $settings["emailSettings"]['username'] ?? '',
            'password' => $settings["emailSettings"]['password'] ?? '',
            'timeout' => null,
            'auth_mode' => null,
        ]);
        Config::set('mail.from', [
            'address' => $settings["emailSettings"]['username'] ?? '',
            'name' => $settings['businessInfo']['name'] ?? 'GYM App',
        ]);

        Mail::purge('smtp');
    }

    private function sendMail($customer, $subscription, $type, $settings, $planName, $expiryDate)
    {
        $template = $settings['messageTemplate'][$type] ?? '';
        $messageBody = str_replace(
            ['{name}','{plan_name}', '{expiry_date}'],
            [$customer->name,$planName, $expiryDate],
            $template
        );
        $subject = "L'etat de votre abonnement";

        Mail::mailer('smtp')->to($customer->email)->queue(new NotificationMail($customer->name, $messageBody, $subject));
    }
}
