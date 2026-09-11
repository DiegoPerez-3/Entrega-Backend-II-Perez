import { ticketsDao } from '../daos/tickets.dao.js';

// Patrón Repository para Tickets.
// Permite a PurchaseService registrar y consultar tickets a través del DAO.
class TicketsRepository {
  async create(data) {
    return ticketsDao.create(data);
  }

  async getById(id) {
    return ticketsDao.getById(id);
  }

  async getByCode(code) {
    return ticketsDao.getByCode(code);
  }
}

export const ticketsRepository = new TicketsRepository();
