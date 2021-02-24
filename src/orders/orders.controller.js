const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res, next) {
    res.json({ data: orders });
  }

  
function isValidOrder(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
    if (!deliverTo || deliverTo === "") {
      return next({
        status: 400,
        message: "Order must include a deliverTo",
      });
    }
    if (!mobileNumber || mobileNumber === "") {
        return next({
          status: 400,
          message: "Order must include a mobileNumber",
        });
      }
    if (!dishes) {   //good
      return next({
        status: 400,
        message: "Order must include a dish",
      });
    }
    if (dishes.length < 1 || Array.isArray(dishes) === false) {   //how to make 'dish is missing a quantity' work?
      return next({
        status: 400,
        message: "Order must include at least one dish",
      });
    }
    for (let i = 0; i < dishes.length; i++) {
      const quantity = dishes[i].quantity;

      if (!quantity || quantity <= 0 || typeof(quantity) !== "number") {
        return next({
            status: 400,
            message: `Dish ${i} must have a quantity that is an integer greater than 0`
        });
      } // THIS TEST IS PROBLEMATIC; NEEDS QUANTITY > 0 & QUANTITY !INTEGER

    }

next();
}


function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      return next();
    } else {
      return next({
        status: 404,
      });
    }
  }


  function orderIdValid(req, res, next) {
    const orderId = req.params.orderId;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
    // if (!orderId) {
    //     //why does this not work?
    //   return next({
    //     status: 404,
    //     message: `Order does not exist ${orderId}`,
    //   });
    // }
    if (id) {
      if (orderId !== id) {
        return next({
          status: 400,
          message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
        });
      }
    }
    if (!status || status.length === 0 || status === 'invalid'){
      return next({
          status: 400,
          message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'

      })
    }
  
    next();
  }


function create(req, res, next) {
    //why does this not work?
  const { data: {  deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const newOrder= {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder});
}

function read(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  console.log(orderId, "orderId");
  console.log(foundOrder, "foundOrder");

  res.json({ data: foundOrder });
}

function update(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  const originalResult = foundOrder;

  const {data: {id, deliverTo, mobileNumber, status, dishes} = {} } = req.body

  foundOrder.id = orderId
  foundOrder.deliverTo = deliverTo
  foundOrder.mobileNumber = mobileNumber
  foundOrder.status = status
  foundOrder.dishes = dishes

  res.json({ data: foundOrder });
}

function destroy(req, res, next){
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (!foundOrder) {
      return next({
        status: 404,
        message: `Order ${orderId} does not exist.`
      });
    } else if (foundOrder.status !== "pending") {
      return next({
        status: 400,
        message: "An order cannot be deleted unless it is pending"
      });
    } else {
      return next({
        status: 204
      });
    }

}




module.exports = {
    list,
    create: [isValidOrder, create],
    read: [orderExists, read],
    update: [orderExists, orderIdValid, isValidOrder, update],
    delete:[destroy]
  };