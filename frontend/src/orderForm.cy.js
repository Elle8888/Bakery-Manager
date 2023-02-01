import React from 'react'
import OrderForm from './orderForm'
import App from './App'


describe('<OrderForm />', () => {

  const mockOrder = {
    placeholder: "Company Name"}

  it('renders', () => {
    cy.mount(<OrderForm placeholder={mockOrder}/>)
  })
  
  it('display the form with inputs', () => {
    cy.mount(<OrderForm />);
    cy.get('[data-cy="company_name"]').type("text");
    cy.get('[data-cy="order_summary"]').type("text");
    // cy.get("#needed_by_date").type("date");
    // cy.get("#submit").click();
  })

  it('display the form with date', () => {
    cy.mount(<OrderForm />);
  
    // cy.get("#needed_by_date").type("date");
    // cy.get("#submit").click();
  })
})