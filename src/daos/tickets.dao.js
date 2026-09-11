import ticketModel from '../models/ticket.model.js';

// Capa de Acceso a Datos (DAO) para Tickets de compra.
// Administra la persistencia de comprobantes generados al concretar compras.
class TicketsDao {
  // Crear y guardar un nuevo ticket en la base de datos
  async create(data) {
    return ticketModel.create(data);
  }

  // Buscar un ticket por su ID
  async getById(id) {
    return ticketModel.findById(id);
  }

  // Buscar ticket por su código único (UUID)
  async getByCode(code) {
    return ticketModel.findOne({ code });
  }
}

export const ticketsDao = new TicketsDao();
