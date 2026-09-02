import nodemailer from "nodemailer";

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendTicketConfirmation(user, event, ticket) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: `Inscripción confirmada - ${event.title}`,
      html: `
        <h2>Inscripción confirmada</h2>

        <p>Hola ${user.first_name},</p>

        <p>Tu inscripción al evento <strong>${event.title}</strong> fue confirmada correctamente.</p>

        <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleString(
          "es-AR"
        )}</p>

        <p><strong>Lugar:</strong> ${event.location}</p>

        <p><strong>Cantidad:</strong> ${ticket.quantity}</p>

        <p><strong>Código de reserva:</strong> ${ticket.reservationCode}</p>

        <p>Guardá este código para identificar tu inscripción.</p>
      `,
    });
  }
}

export default new MailService();