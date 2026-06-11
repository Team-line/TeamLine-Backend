export const workspaceInviteTemplate = (workspaceName, inviteLink) => {
  return `
    <div style="font-family: sans-serif; padding: 20px; color: #333; direction: rtl; text-align: right;">
      <h2>لقد تمت دعوتك للانضمام!</h2>
      <p>مرحباً،</p>
      <p>لقد تم دعوتك للانضمام إلى مساحة العمل <strong>${workspaceName}</strong> في منصتنا.</p>
      <p>يرجى الضغط على الرابط أدناه لقبول الدعوة والانضمام إلى الفريق:</p>
      <br />
      <div style="margin: 20px 0;">
        <a href="${inviteLink}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">قبول الدعوة والانضمام</a>
      </div>
      <br />
      <p>بالتوفيق،<br />فريق العمل</p>
    </div>
  `;
};
