/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  /** find the top 10 customers, those with the most reservations */

  static async topCustomers() {
    const results = await db.query(
      `SELECT first_name AS "firstName", last_name AS "lastName", customer_id, COUNT(*) as numReservations
      FROM reservations
      JOIN customers on reservations.customer_id = customers.id
      GROUP BY first_name, last_name, customer_id
      ORDER BY numReservations DESC
      LIMIT 10`
    );
    return results.rows
  }

  /** save this reservation */
  async save(){
    if(this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]);
        this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET customer_id=$1, num_guests=$2, start_at=$3, notes=$4
        WHERE id=$5`,
        [this.customerId, this.numGuests, this.startAt, this.notes, this.id]);
    }
  }
}


module.exports = Reservation;
