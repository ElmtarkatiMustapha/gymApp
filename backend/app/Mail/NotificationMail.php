<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class NotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $name;
    public $messageBody;
    public $mailSubject;
    public $businessInfo;
    public $logoUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($name, $messageBody, $mailSubject)
    {
        $this->name = $name;
        $this->messageBody = $messageBody;
        $this->mailSubject = $mailSubject;

        // Load business info from settings for use in the email template
        $path = resource_path('js/settings.json');
        if (File::exists($path)) {
            $settings = json_decode(File::get($path), true);
            $this->businessInfo = $settings['businessInfo'] ?? [];
            $logoFile = $this->businessInfo['logo'] ?? null;
            
            // Resolve the physical absolute path to the file so we can attach it inline
            if ($logoFile && File::exists(storage_path('app/private/images/' . $logoFile))) {
                $this->logoUrl = storage_path('app/private/images/' . $logoFile);
            } elseif ($logoFile && File::exists(storage_path('app/public/images/' . $logoFile))) {
                $this->logoUrl = storage_path('app/public/images/' . $logoFile);
            } else {
                $this->logoUrl = null;
            }
        } else {
            $this->businessInfo = [];
            $this->logoUrl = null;
        }
    }

    private function configureSMTP()
    {
        $path = resource_path('js/settings.json');
        if (File::exists($path)) {
            $settings = json_decode(File::get($path), true);
            
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
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $this->configureSMTP();
        return new Envelope(
            subject: $this->mailSubject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.notification',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
