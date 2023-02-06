import React from 'react';
import { useState, useEffect } from 'react';

export default function Item(props) {

  const [counter, setCounter] = useState(0)
  const [basketText, setBasketText] = useState("Add to Basket"); 
  const [inBasket, setInBasket] = useState(false); 
  const [batchID, setBatchID] = useState(""); 
  const [quantityInBasket, setQuantityInBasket] = useState(); 

  const changeCounter = (amount) =>{
    if ((counter > 0 && amount === -1) || (amount === +1)){
      setCounter((prevCounter) => prevCounter + amount)
    }

    if(!inBasket){
      changeBasketButtonText("Add to Basket")
    }else{
      changeBasketButtonText("Update Basket")
    }
  }

  //Fetch batch orders within basket
  useEffect(() => {
      fetch("/orders/getBasketInfo/63dbab59d49bd03887f3aafe", {
      })
      .then(response => response.json())
      .then(async data => {
        data[0].orders.forEach(element => {
          if (element.itemName === props.food.itemName){
            setInBasket(true)
            setBatchID(element._id)
            changeBasketButtonText("In Basket")
            setCounter(element.batchQuantity)
            setQuantityInBasket(element.batchQuantity)
          }
        });
      });
  // }, [props.updateBasket])
  }, [])
  


const addBatchToOrder = async () => {
    let response = await fetch('/orders/addBatch', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({ itemName: props.food.itemName, batchQuantity: counter, pricePerBatch: props.food.price})
      })
    if (response.status !== 201) {
      console.log("post failed, Error status:" + response.status)
    } else {
      console.log("Batch added: " + response.status)
      let data = await response.json()
      console.log("BATCH ORDER ADDED:", data)
      props.setUpdateBasket(!props.updateBasket)
      setBatchID(data.batchOrder._id)
    }
  }

  const removeBatchFromOrder = async () => {
    let response = await fetch(`/orders/delete/batch/${batchID}`, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      }, })
    if (response.status !== 201) {
      console.log("post failed, Error status:" + response.status)
    } else {
      console.log("Batch removed: " + response.status)
      props.setUpdateBasket(!props.updateBasket)
    }
  }
  
  const updateBatchOrder = async () =>{
    let response = await fetch(`batchOrders/update/batch/${batchID}`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({batchQuantity: counter})
    })
    if (response.status !== 202){
      console.log("patch failed, Error status:" + response.status)
    }
    else{
      console.log("Batch updated:" + response.status)
      console.log("NEW AMOUNT:" + counter)
      props.setUpdateBasket(!props.updateBasket)

      }
    }

  const updateBasket = () => {
    //if remove item from basket
    if (inBasket && quantityInBasket === counter){
      changeBasketButtonText("Add to basket")
      setInBasket(false)
      setCounter(0)
      removeBatchFromOrder();
    }
    //if in basket but quantity has been changed
    else if (inBasket && quantityInBasket !== counter){
      changeBasketButtonText("In Basket")
      updateBatchOrder();
      setInBasket(true)
      setQuantityInBasket(counter)
    }
    //if not in basket
    else if (!inBasket && counter >0){
      changeBasketButtonText("In Basket")
      setInBasket(true)
      addBatchToOrder();
      setQuantityInBasket(counter)
    }
  }
  const changeBasketButtonText = (text) => setBasketText(text);


    return (
      <div className="m-10 place-content-evenly bg-green card w-96 bg-base-100 shadow-xl card-bordered">
        <div className="object-fit contain">
        <figure class="rounded -lg max-w-lg h-64 relative max-w-sm transition-all duration-300 ">
            <a href="#">
              <img class="rounded-lg" src={props.food.image} />
          </a>
          </figure>
        <div className="rounded-b-lg bg-green card-body">
          <div className="bg-green text-black">
            <h1 className="card-title heading">{props.food.itemName}</h1>
            <p>Price: £{props.food.price.toFixed(2)}</p>
            <p>Batch Quantity: {props.food.batchQuantity}</p>
          </div>
      <div className="card-actions justify-end w-28">
      <button data-cy="decrease-btn" class='btn btn-circle btn-sm' onClick={()=>{changeCounter(-1)}}>-</button>
        <p className='text-center text-black' data-cy="counter">{counter}</p>
        <button data-cy="increase-btn" className='btn btn-circle btn-sm' onClick={()=>{changeCounter(1)}}>+</button>
      </div>
      <div data-cy="basket-btn" className="btn" onClick={() => updateBasket()}>{basketText}</div>

    </div>
        </div>
        </div>
    )
  }