const nodemailer = require("nodemailer");
const fs = require('fs')
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'})

const template = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
 <head>
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta charset="UTF-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Registro exitoso</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG></o:AllowPNG>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <style type="text/css">
#outlook a {
	padding:0;
}
.es-button {
	mso-style-priority:100!important;
	text-decoration:none!important;
}
a[x-apple-data-detectors] {
	color:inherit!important;
	text-decoration:none!important;
	font-size:inherit!important;
	font-family:inherit!important;
	font-weight:inherit!important;
	line-height:inherit!important;
}
.es-desk-hidden {
	display:none;
	float:left;
	overflow:hidden;
	width:0;
	max-height:0;
	line-height:0;
	mso-hide:all;
}
[data-ogsb] .es-button {
	border-width:0!important;
	padding:10px 20px 10px 20px!important;
}
@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } .h-auto { height:auto!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }
</style>
 </head>
 <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div class="es-wrapper-color" style="background-color:#ffffff"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#e4e2e2" origin="0.5, 0" position="0.5, 0"></v:fill>
			</v:background>
		<![endif]-->
   <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" 
   style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#ffffff">
      <tr>
        <td valign="top" style="padding:0;Margin:0">
         <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
           <tr>
            <td align="center" style="padding:0;Margin:0">
             <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
               <tr>
                <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                 <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://abcifx.stripocdn.email/content/guids/CABINET_09b10bf9dbe2eec52e0b58144f74fd97/images/email.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; height: 6rem !important; width: auto !important;"></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
               <tr>
                <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                 <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:30px;font-style:normal;font-weight:normal;color:#333333;text-align:center">Bienvenido a IRODUM.COM</h1></td>
                       </tr>
                       <tr>
                        <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:27px;color:#999999;font-size:18px">Te damos la más cordial bienvenida a nuestra comunidad, esperamos que puedas&nbsp;sacar el máximo provecho a las oportunidades que se te presenten, ÉXITO!!&nbsp;</p></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
         </table>
         <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
           <tr>
            <td align="center" style="padding:0;Margin:0">
             <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;width:600px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
               <tr>
                <td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><!--[if mso]><table style="width:560px" cellpadding="0" 
                          cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
                 <table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                   <tr>
                    <td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:270px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" style="padding:0;Margin:0;font-size:0px"><img class="adapt-img" src="https://abcifx.stripocdn.email/content/guids/CABINET_09b10bf9dbe2eec52e0b58144f74fd97/images/shield.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;height: 6rem !important; width: auto !important;"></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table><!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
                 <table cellpadding="0" cellspacing="0" class="es-right" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                   <tr>
                    <td align="left" style="padding:0;Margin:0;width:270px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;color:#333333;font-size:14px">Le recordamos encarecidamente que proteja sus credenciales de acceso.</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;color:#333333;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;color:#333333;font-size:14px">IRODUM.COM , jamás le solicitará sus información personal ni datos bancarios.&nbsp;</p></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table><!--[if mso]></td></tr></table><![endif]--></td>
               </tr>
             </table></td>
           </tr>
         </table>
         <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
           <tr>
            <td align="center" style="padding:0;Margin:0">
             <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
               <tr>
                <td align="left" style="padding:0;Margin:0">
                 <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" style="padding:10px;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';line-height:21px;color:#d22521;font-size:14px">Por favor, lea los términos y condiciones adjuntados en éste correo electrónico.</p></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
               <tr>
                <td align="left" style="padding:0;Margin:0;background-position:center center">
                 <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px">
                         <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:none;height:1px;width:100%;margin:0px"></td>
                           </tr>
                         </table></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
         </table>
         <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
           <tr>
            <td align="center" style="padding:0;Margin:0">
             <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
               <tr>
                <td style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background-color:#212529;background-position:left bottom" bgcolor="#ffffff" align="left"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]-->
                 <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                   <tr>
                    <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:180px">
                     <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td class="es-m-txt-c" align="left" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://www.irodum.com" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://abcifx.stripocdn.email/content/guids/CABINET_09b10bf9dbe2eec52e0b58144f74fd97/images/logotipo.png" alt style="display:block;border:0;outline:none;text-decoration:none;width: 200px;-ms-interpolation-mode:bicubic"></a></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table><!--[if mso]></td><td style="width:20px"></td><td style="width:360px" valign="top"><![endif]-->
                 <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="left" style="padding:0;Margin:0;width:360px">
                     <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td class="es-m-txt-c" align="right" style="padding:0;Margin:0;padding-top:10px;font-size:0px">
                         <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img title="Facebook" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/facebook-circle-colored.png" alt="Fb" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
                            <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img title="Twitter" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/twitter-circle-colored.png" alt="Tw" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
                            <td valign="top" align="center" style="padding:0;Margin:0"><img title="Instagram" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/instagram-circle-colored.png" alt="Inst" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
                           </tr>
                         </table></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table><!--[if mso]></td></tr></table><![endif]-->
                </td>
               </tr>
             </table>
            </td>
           </tr>
         </table>
        </td>
       </tr>
  </div>
  </div>
 </body>
</html>`

const createTrans1 = () =>{
    const transport = nodemailer.createTransport({
        host: "smtp.titan.email",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER1,
          pass: process.env.EMAIL_PASS, 
        },
    });
    return transport;
}

const createTrans2 = () =>{
  const transport = nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER2,
        pass: process.env.EMAIL_PASS, 
      },
  });
  return transport;
}

// send mail with defined transport object
const sendWelcomeEmail = async (user) =>{

    const transporter = createTrans1();
    let info = await transporter.sendMail({
        from: '"Registro Exitoso! 👻" <soporte@irodum.com>', // sender address
        to: `${user.email}`, // list of receivers
        subject: `Hola ${user.name} Bienvenido a IRODUM.COM`, // Subject line
        html: template, // html body
        // attachments: [
        //     {   // utf-8 string as an attachment
        //         filename: 'TérminosyCondiciones.pdf',
        //         contents: fs.createReadStream('./mail/TérminosyCondiciones.pdf')
        //     }
        // ]
    });
    return info
}

// send mail with defined transport object
const sendRequestEmail = async (userrequest) =>{

  const transporter = createTrans1();
  let info = await transporter.sendMail({
      from: '"Solicitud recibida" <soporte@irodum.com>', // sender address
      to: `${userrequest.emailWorker}`, // list of receivers
      subject: `Buen dia ${userrequest.nameWorker}, ${userrequest.nameClient} le ha enviado una solicitud de trabajo`, // Subject line
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
      <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>Nueva solicitud</title><!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
      <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <style type="text/css">
      #outlook a {
      padding:0;
      }
      .es-button {
      mso-style-priority:100!important;
      text-decoration:none!important;
      }
      a[x-apple-data-detectors] {
      color:inherit!important;
      text-decoration:none!important;
      font-size:inherit!important;
      font-family:inherit!important;
      font-weight:inherit!important;
      line-height:inherit!important;
      }
      .es-desk-hidden {
      display:none;
      float:left;
      overflow:hidden;
      width:0;
      max-height:0;
      line-height:0;
      mso-hide:all;
      }
      [data-ogsb] .es-button {
      border-width:0!important;
      padding:10px 30px 10px 30px!important;
      }
      @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:8px !important; padding-right: 8px !important; } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
      </style>
      </head>
      <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:80%;-ms-text-size-adjust:10%;padding:0;Margin:0">
      <div class="es-wrapper-color" style="background-color:#FAFAFA"><!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
      <v:fill type="tile" color="#fafafa"></v:fill>
      </v:background>
      <![endif]-->
      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
      <tr>
      <td valign="top" style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
      <tr>
      <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
      <table width="100%" role="presentation" style="border-collapse: separate !important;border-spacing:0px">
      <tr>
      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img src="https://abcifx.stripocdn.email/content/guids/CABINET_09b10bf9dbe2eec52e0b58144f74fd97/images/request.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="100"></td>
      </tr>
      <tr>
      <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:10px"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333">Solicitud Recibida</h1></td>
      </tr>
      <tr>
      <td align="center" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:5px;padding-bottom:20px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Acabas de recibir una solicitud de trabajo por parte de ${userrequest.nameClient}, te recomendamos acuerdes el trabajo lo antes posible para comenzar a trabajar.</p></td>
      </tr>
      <tr style="padding-bottom:20px !important">
      <td align="left" class="es-m-p0r es-m-p0l" style="border: 1px solid rgb(40 151 176 / 43%);border-radius: 15px 15px;Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#6d2421;font-size:14px">
            <p style="padding-top:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;color:#3a5990;font-size:14px">
            <strong>Para acordar el trabajo: </strong>
            <ol>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Debes iniciar sesión.</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Hacer click en la fotografía ubicada en la esquina superior derecha.</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Selecciona opción nuevas solicitudes.</li>
            </ol>
            </p> 
            <p style="padding-top:10px;font-family:arial, 'helvetica neue', helvetica, sans-serif;color:#3a5990;font-size:14px">
            <strong>Información de la solicitud: </strong>
            <ul>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Nombre del cliente: ${userrequest.nameClient}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Email del cliente: ${userrequest.emailClient}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Descripción del trabajo: ${userrequest.message}</li>
            </ul>
            </p>        
      </td>
      </tr>
      <tr>
      <td align="center" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Si quieres convenir el trabajo de forma inmediata, haz click en el botón <strong>Iniciar Sesión</strong>, te redireccionará a irodum.com para que ingreses a tu perfil.</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"></p></td>
      </tr>
      <tr>
      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><!--[if mso]><a href="irodum.com/login" target="_blank" hidden>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="irodum.com/login"
      style="height:44px; v-text-anchor:middle; width:181px" arcsize="14%" stroke="f" fillcolor="#325ea4">
      <w:anchorlock></w:anchorlock>
      <center style='color:#ffffff; font-family:arial, "helvetica neue", helvetica, sans-serif; font-size:18px; font-weight:400; line-height:18px; mso-text-raise:1px'>Iniciar Sesión</center>
      </v:roundrect></a>
      <![endif]--><!--[if !mso]><!-- --><span class="msohide es-button-border" style="border-style:solid;border-color:#2CB543;background-color:#fe6b68;border-width:0px;display:inline-block;border-radius:6px;width:auto;mso-hide:all"><a href="https://www.irodum.com/login" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;border-style:solid;border-color:#fe6b68;border-width:10px 30px 10px 30px;display:inline-block;background:#fe6b68;border-radius:6px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center;border-left-width:30px;border-right-width:30px">Iniciar Sesión</a></span><!--<![endif]--></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td class="es-info-area" align="center" style="padding:0;Margin:0">
      <table class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" bgcolor="#FFFFFF">
      <tr>
      <td align="left" bgcolor="#ffffff" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background-color:#212529"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
      <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
      <tr>
      <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:270px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td class="es-infoblock es-m-txt-c" align="left" style="padding:0;Margin:0;line-height:0px;font-size:0px;color:#CCCCCC"><img src="https://abcifx.stripocdn.email/content/guids/CABINET_09b10bf9dbe2eec52e0b58144f74fd97/images/logotipo.png" alt style="display:block;border:0;outline:none;text-decoration:none;width: 200px;-ms-interpolation-mode:bicubic"></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
      <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" style="padding:0;Margin:0;width:270px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td class="es-m-txt-c" align="right" style="padding:0;Margin:0;padding-top:10px;font-size:0px">
      <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img title="Facebook" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/facebook-circle-colored.png" alt="Fb" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img title="Twitter" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/twitter-circle-colored.png" alt="Tw" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      <td valign="top" align="center" style="padding:0;Margin:0"><img title="Instagram" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/instagram-circle-colored.png" alt="Inst" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td></tr></table><![endif]--></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      </div>
      </body>
      </html>`, // html body
  });
  return info
}

// send mail with defined transport object
const sendRequestResponseEmail = async (userresponse) =>{
  const transporter = createTrans1();
  let info = await transporter.sendMail({
      from: '"Solicitud respondida" <soporte@irodum.com>', // sender address
      to: `${userresponse.emailClient}`, // list of receivers
      cc: `${userresponse.emailWorker}`,
      subject: `Buen dia ${userresponse.nameClient}, ${userresponse.nameWorker} ha respondido a su solicitud de trabajo`, // Subject line
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
      <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>Nueva solicitud</title><!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
      <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <style type="text/css">
      #outlook a {
      padding:0;
      }
      .es-button {
      mso-style-priority:100!important;
      text-decoration:none!important;
      }
      a[x-apple-data-detectors] {
      color:inherit!important;
      text-decoration:none!important;
      font-size:inherit!important;
      font-family:inherit!important;
      font-weight:inherit!important;
      line-height:inherit!important;
      }
      .es-desk-hidden {
      display:none;
      float:left;
      overflow:hidden;
      width:0;
      max-height:0;
      line-height:0;
      mso-hide:all;
      }
      [data-ogsb] .es-button {
      border-width:0!important;
      padding:10px 30px 10px 30px!important;
      }
      @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:8px !important; padding-right: 8px !important; } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
      </style>
      </head>
      <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:80%;-ms-text-size-adjust:10%;padding:0;Margin:0">
      <div class="es-wrapper-color" style="background-color:#FAFAFA"><!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
      <v:fill type="tile" color="#fafafa"></v:fill>
      </v:background>
      <![endif]-->
      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
      <tr>
      <td valign="top" style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
      <tr>
      <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
      <table width="100%" role="presentation" style="border-collapse: separate !important;border-spacing:0px">
      <tr>
      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img src="https://abcifx.stripocdn.email/content/guids/CABINET_165602655b82edeb907c3b676d3f4c8e/images/solicitud.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="100"></td>
      </tr>
      <tr>
      <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:10px"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333">Solicitud Respondida</h1></td>
      </tr>
      <tr>
      <td align="center" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:5px;padding-bottom:20px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">
            Acabas de recibir respuesta a tu solicitud de trabajo por parte del trabajador ${userresponse.nameWorker}, te recomendamos ponerse en contacto a la brevedad  por este mismo medio.</p></td>
      </tr>
      <tr style="padding-bottom:20px !important">
      <td align="left" class="es-m-p0r es-m-p0l" style="border: 1px solid rgb(40 151 176 / 43%);border-radius: 15px 15px;Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#6d2421;font-size:14px">
            <p style="padding-top:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;color:#3a5990;font-size:14px">
            <strong>Respuesta a la solicitud: </strong>
            <ul>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Nombre del trabajador: ${userresponse.nameWorker}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Email del trabajador: ${userresponse.emailWorker}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Respuesta: ${userresponse.message}</li>
            </ul>
            </p> 
            <p style="padding-top:10px;font-family:arial, 'helvetica neue', helvetica, sans-serif;color:#3a5990;font-size:14px">
            <strong>Información de la solicitud: </strong>
            <ul>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Nombre del cliente: ${userresponse.nameClient}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Email del cliente: ${userresponse.emailClient}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Requerimiento: ${userresponse.requestInfo}</li>
            </ul>
            </p>        
      </td>
      </tr>
      <tr>
      <td align="right" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:20px;padding-bottom:0px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Solicitud Número: </strong>${userresponse.solicitud}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"></p></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td class="es-info-area" align="center" style="padding:0;Margin:0">
      <table class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" bgcolor="#FFFFFF">
      <tr>
      <td align="left" bgcolor="#ffffff" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background-color:#212529"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
      <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
      <tr>
      <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:270px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td class="es-infoblock es-m-txt-c" align="left" style="padding:0;Margin:0;line-height:0px;font-size:0px;color:#CCCCCC"><img src="https://abcifx.stripocdn.email/content/guids/CABINET_09b10bf9dbe2eec52e0b58144f74fd97/images/logotipo.png" alt style="display:block;border:0;outline:none;text-decoration:none;width: 200px;-ms-interpolation-mode:bicubic"></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
      <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" style="padding:0;Margin:0;width:270px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td class="es-m-txt-c" align="right" style="padding:0;Margin:0;padding-top:10px;font-size:0px">
      <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img title="Facebook" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/facebook-circle-colored.png" alt="Fb" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img title="Twitter" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/twitter-circle-colored.png" alt="Tw" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      <td valign="top" align="center" style="padding:0;Margin:0"><img title="Instagram" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/instagram-circle-colored.png" alt="Inst" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td></tr></table><![endif]--></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      </div>
      </body>
      </html>`, // html body
  });
  return info
}

// send mail with defined transport object
const sendResetPasswordLink = async (objectResetPass) =>{
  const transporter = createTrans1();
  let info = await transporter.sendMail({
      from: '"Solicitud recuperación de clave" <soporte@irodum.com>', // sender address
      to: `${objectResetPass.mail}`, // list of receivers
      subject: `Estimado trabajador, hemos recibido su solicitud de reinicio de contraseña`, // Subject line
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
      <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>Nueva solicitud</title><!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
      <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <style type="text/css">
      #outlook a {
      padding:0;
      }
      .es-button {
      mso-style-priority:100!important;
      text-decoration:none!important;
      }
      a[x-apple-data-detectors] {
      color:inherit!important;
      text-decoration:none!important;
      font-size:inherit!important;
      font-family:inherit!important;
      font-weight:inherit!important;
      line-height:inherit!important;
      }
      .es-desk-hidden {
      display:none;
      float:left;
      overflow:hidden;
      width:0;
      max-height:0;
      line-height:0;
      mso-hide:all;
      }
      [data-ogsb] .es-button {
      border-width:0!important;
      padding:10px 30px 10px 30px!important;
      }
      @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:8px !important; padding-right: 8px !important; } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
      </style>
      </head>
      <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:80%;-ms-text-size-adjust:10%;padding:0;Margin:0">
      <div class="es-wrapper-color" style="background-color:#FAFAFA"><!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
      <v:fill type="tile" color="#fafafa"></v:fill>
      </v:background>
      <![endif]-->
      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
      <tr>
      <td valign="top" style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
      <tr>
      <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
      <table width="100%" role="presentation" style="border-collapse: separate !important;border-spacing:0px">
      <tr>
      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:20px;font-size:0px"><img src="https://abcifx.stripocdn.email/content/guids/CABINET_09b10bf9dbe2eec52e0b58144f74fd97/images/forgotpassword.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="100"></td>
      </tr>
      <tr>
      <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:10px"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333">¿Olvidó su contraseña?</h1></td>
      </tr>
      <tr>
      <td align="center" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:5px;padding-bottom:20px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">No te preocupes, estamos aquí para ayudarte. <br> Se ha generado un enlace de recuperación de clave con una duración de 15 minutos.
      Luego de eso, el enlace no será válido y tendrá que generar una nueva solicitud para recuperar su contraseña. <br>Le recomendamos continuar con su proceso inmediatamente.</p></td>
      </tr>
      <tr>
      <td align="center" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Para continuar con el proceso de recuperación de clave, debe hacer click en el botón <strong>"Recuperar contraseña"</strong> que se encuentra a continuación.</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"></p></td>
      </tr>
      <tr>
      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><!--[if mso]><a href="https://www.irodum.com/login" target="_blank" hidden>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="https://www.irodum.com/login"
      style="height:44px; v-text-anchor:middle; width:181px" arcsize="14%" stroke="f" fillcolor="#325ea4">
      <w:anchorlock></w:anchorlock>
      <center style='color:#ffffff; font-family:arial, "helvetica neue", helvetica, sans-serif; font-size:18px; font-weight:400; line-height:18px; mso-text-raise:1px'>Iniciar Sesión</center>
      </v:roundrect></a>
      <![endif]--><!--[if !mso]><!-- --><span class="msohide es-button-border" style="border-style:solid;border-color:#2CB543;background-color:#fe6b68;border-width:0px;display:inline-block;border-radius:6px;width:auto;mso-hide:all"><a href=${objectResetPass.enlace} class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;border-style:solid;border-color:#fe6b68;border-width:10px 30px 10px 30px;display:inline-block;background:#fe6b68;border-radius:6px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center;border-left-width:30px;border-right-width:30px">Recuperar contraseña</a></span><!--<![endif]--></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td class="es-info-area" align="center" style="padding:0;Margin:0">
      <table class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" bgcolor="#FFFFFF">
      <tr>
      <td align="left" bgcolor="#ffffff" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;background-color:#212529"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
      <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
      <tr>
      <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:270px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td class="es-infoblock es-m-txt-c" align="left" style="padding:0;Margin:0;line-height:0px;font-size:0px;color:#CCCCCC"><img src="https://abcifx.stripocdn.email/content/guids/CABINET_09b10bf9dbe2eec52e0b58144f74fd97/images/logotipo.png" alt style="display:block;border:0;outline:none;text-decoration:none;width: 200px;-ms-interpolation-mode:bicubic"></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
      <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" style="padding:0;Margin:0;width:270px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td class="es-m-txt-c" align="right" style="padding:0;Margin:0;padding-top:10px;font-size:0px">
      <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img title="Facebook" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/facebook-circle-colored.png" alt="Fb" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img title="Twitter" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/twitter-circle-colored.png" alt="Tw" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      <td valign="top" align="center" style="padding:0;Margin:0"><img title="Instagram" src="https://abcifx.stripocdn.email/content/assets/img/social-icons/circle-colored/instagram-circle-colored.png" alt="Inst" width="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td></tr></table><![endif]--></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      </div>
      </body>
      </html>`, // html body
  });
  return info
}

// send mail with defined transport object
const sendContactMessagge = async (objectResetPass) =>{
  const transporter = createTrans1();
  let info = await transporter.sendMail({
      from: '"Irodum contacto" <soporte@irodum.com>', // sender address
      to: `soporte@irodum.com`, // list of receivers
      subject: `Mensaje enviado desde página de contacto`, // Subject line
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
      <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>Mensaje desde página de contacto</title><!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
      <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <style type="text/css">
      #outlook a {
      padding:0;
      }
      .es-button {
      mso-style-priority:100!important;
      text-decoration:none!important;
      }
      a[x-apple-data-detectors] {
      color:inherit!important;
      text-decoration:none!important;
      font-size:inherit!important;
      font-family:inherit!important;
      font-weight:inherit!important;
      line-height:inherit!important;
      }
      .es-desk-hidden {
      display:none;
      float:left;
      overflow:hidden;
      width:0;
      max-height:0;
      line-height:0;
      mso-hide:all;
      }
      [data-ogsb] .es-button {
      border-width:0!important;
      padding:10px 30px 10px 30px!important;
      }
      @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:8px !important; padding-right: 8px !important; } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
      </style>
      </head>
      <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:80%;-ms-text-size-adjust:10%;padding:0;Margin:0">
      <div class="es-wrapper-color" style="background-color:#FAFAFA"><!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
      <v:fill type="tile" color="#fafafa"></v:fill>
      </v:background>
      <![endif]-->
      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
      <tr>
      <td valign="top" style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
      <tr>
      <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
      <table width="100%" role="presentation" style="border-collapse: separate !important;border-spacing:0px">
      <tr>
      <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;padding-bottom:10px"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333">Mensaje desde página de contacto</h1></td>
      </tr>
      <tr>
      <td align="center" class="es-m-p0r es-m-p0l" style="Margin:0;padding-top:5px;padding-bottom:20px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Se ha enviado un mensaje desde la página de contacto, a continuación podrás ver el contenido del mensaje.</p></td>
      </tr>
      <tr style="padding-bottom:20px !important">
      <td align="left" class="es-m-p0r es-m-p0l" style="border: 1px solid rgb(40 151 176 / 43%);border-radius: 15px 15px;Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#6d2421;font-size:14px">
            <p style="padding-top:10px;font-family:arial, 'helvetica neue', helvetica, sans-serif;color:#3a5990;font-size:14px">
            <strong>Información del mensaje: </strong>
            <ul>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Nombre del usuario: ${objectResetPass.nameClient}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Email del usuario: ${objectResetPass.emailClient}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Teléfono del usuario: ${objectResetPass.cellClient}</li>
                  <li style="font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#373737;font-size:14px">Descripción del mensaje: ${objectResetPass.message}</li>
            </ul>
            </p>        
      </td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      </tr>
      </table>
      </div>
      </body>
      </html>`, // html body
  });
  return info
}
exports.sendWelcomeEmail = (user) => sendWelcomeEmail(user)
exports.sendRequestEmail = (userrequest) => sendRequestEmail(userrequest)
exports.sendRequestResponseEmail = (userresponse) => sendRequestResponseEmail(userresponse)
exports.sendResetPasswordLink = (objectResetPass) => sendResetPasswordLink(objectResetPass)
exports.sendContactMessagge = (objectEmailContact) => sendContactMessagge(objectEmailContact)