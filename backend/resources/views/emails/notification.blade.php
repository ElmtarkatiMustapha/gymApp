<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $mailSubject }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #EDECF2; color: #333; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: #027CC5; padding: 30px 40px; text-align: center; }
        .header img { max-height: 70px; max-width: 200px; object-fit: contain; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; }
        .header h1 { color: #ffffff; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.5px; }
        .header p.subtitle { color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-top: 4px; }
        .body { padding: 35px 40px; }
        .greeting { font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 16px; }
        .message-box { background: #f8f9fa; border-left: 4px solid #027CC5; border-radius: 8px; padding: 20px; font-size: 0.98rem; line-height: 1.7; color: #5C5C68; white-space: pre-line; }
        .divider { border: none; border-top: 1px solid #e9ecef; margin: 30px 0; }
        .footer { background: #f8f9fa; padding: 20px 40px; text-align: center; }
        .footer p { color: #adb5bd; font-size: 0.82rem; }
        .footer .gym-name { color: #027CC5; font-weight: 600; }
        .contact-row { margin-top: 8px; font-size: 0.8rem; color: #adb5bd; }
    </style>
</head>
<body>
    <div class="wrapper">
        <!-- Header with Logo -->
        <div class="header">
            @if(isset($logoUrl) && $logoUrl)
                <img src="{{ $message->embed($logoUrl) }}" alt="{{ $businessInfo['name'] ?? 'Gym Logo' }}" />
            @endif
            <h1>{{ $businessInfo['name'] ?? 'GYM Manager' }}</h1>
            @if(!empty($businessInfo['city']))
                <p class="subtitle">{{ $businessInfo['city'] }}{{ !empty($businessInfo['adresse']) ? ' — ' . $businessInfo['adresse'] : '' }}</p>
            @endif
        </div>

        <!-- Body -->
        <div class="body">
            <div class="message-box">
                {!! nl2br(e($messageBody)) !!}
            </div>
        </div>
        <hr class="divider" style="margin: 0 40px;">

        <!-- Footer -->
        <div class="footer">
            <div class="contact-row">
                @if(!empty($businessInfo['phone']))
                    📞 {{ $businessInfo['phone'] }}
                @endif
                @if(!empty($businessInfo['email']))
                    &nbsp;|&nbsp; ✉️ {{ $businessInfo['email'] }}
                @endif
            </div>
        </div>
    </div>
</body>
</html>
