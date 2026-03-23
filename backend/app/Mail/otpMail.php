<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class otpMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $name,$otp;
    public function __construct($name,$otp)
    {
        $this->name = $name;
        $this->otp = $otp;
    }
    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verification code for password reset',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        /**
     * Build the message.
     *
     * @return $this
     */
        return new Content(
            view: 'mail.otpMail',
            with:[
                "name"=>$this->name,
                "otp"=> $this->otp
            ]
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
