export function getWhatsAppEnv() {
  return {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? "",
    templateName: process.env.WHATSAPP_TEMPLATE_NAME ?? "",
    templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US",
  };
}
