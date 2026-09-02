type SupportedLocale = "fr" | "en" | "es";

const SUBJECT: Record<SupportedLocale, string> = {
  fr: "Confirmez votre inscription au club BARMAJATA",
  en: "Confirm your BARMAJATA club subscription",
  es: "Confirme su suscripción al club BARMAJATA",
};

const HEADING: Record<SupportedLocale, string> = {
  fr: "Plus qu'une étape",
  en: "One more step",
  es: "Un último paso",
};

const BODY: Record<SupportedLocale, string> = {
  fr: "Confirmez votre adresse e-mail pour finaliser votre inscription au club BARMAJATA.",
  en: "Confirm your email address to complete your BARMAJATA club subscription.",
  es: "Confirme su dirección de correo electrónico para completar su suscripción al club BARMAJATA.",
};

const CTA: Record<SupportedLocale, string> = {
  fr: "Confirmer mon inscription",
  en: "Confirm my subscription",
  es: "Confirmar la suscripción",
};

const FOOTER: Record<SupportedLocale, string> = {
  fr: "Vous recevez cet e-mail car cette adresse a été utilisée pour s'inscrire sur barmajata.com. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : aucune inscription ne sera activée sans confirmation.",
  en: "You are receiving this email because this address was used to sign up on barmajata.com. If you did not request this, simply ignore this message: no subscription is activated without confirmation.",
  es: "Recibe este correo porque esta dirección se ha utilizado para suscribirse en barmajata.com. Si no ha sido usted, puede ignorar este mensaje: ninguna suscripción se activa sin confirmación.",
};

export function buildConfirmationSubject(locale: SupportedLocale): string {
  return SUBJECT[locale] ?? SUBJECT.fr;
}

export function buildConfirmationHtml(confirmUrl: string, locale: SupportedLocale): string {
  const heading = HEADING[locale] ?? HEADING.fr;
  const body = BODY[locale] ?? BODY.fr;
  const cta = CTA[locale] ?? CTA.fr;
  const footer = FOOTER[locale] ?? FOOTER.fr;

  return `<!doctype html>
<html lang="${locale}" dir="ltr">
  <body style="margin:0;padding:32px 16px;background-color:#fbf8f2;font-family:sans-serif;color:#2a2521;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;">
      <tr>
        <td style="text-align:center;padding-bottom:24px;">
          <span style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#b99b72;">BARMAJATA</span>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding-bottom:12px;">
          <h1 style="font-size:22px;margin:0;">${heading}</h1>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding-bottom:24px;">
          <p style="font-size:15px;line-height:1.5;margin:0;color:#5a5048;">${body}</p>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding-bottom:32px;">
          <a href="${confirmUrl}" style="display:inline-block;background-color:#2a2521;color:#fbf8f2;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;">${cta}</a>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;">
          <p style="font-size:12px;line-height:1.5;margin:0;color:#8e7963;">${footer}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
