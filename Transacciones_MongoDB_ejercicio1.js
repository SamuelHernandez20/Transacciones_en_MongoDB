/* 

--- Primer ejemplo de ejercicio de transacciones avanzado en MongoDB ---

Contexto del ejercicio:

Se trata de realizar un sistema de gestión de pedidos para una tienda en línea ficticia que vende productos electrónicos. 
El sistema debe permitir registrar pedidos, verificar el stock disponible, actualizar el inventario y registrar las transacciones en una colección de auditoría. 
Además, se debe gestionar la información de los clientes para asociar los pedidos con ellos.

*/


const session = db.getMongo().startSession()

session.startTransaction()

const coleccion_clientes = session.getDatabase('Gestion').getCollection('clientes');
const coleccion_pedidos = session.getDatabase('Gestion').getCollection('pedidos');
const coleccion_productos = session.getDatabase('Gestion').getCollection('productos');
const coleccion_auditoria = session.getDatabase('Gestion').getCollection('auditoria');


let nombre_producto = [
  "Teléfono inteligente (Smartphone)",
  "Televisor inteligente (Smart TV)",
  "Tableta (Tablet)",
  "Altavoz inteligente (Smart Speaker)",
  "Reloj inteligente (Smartwatch)",
  "Termostato inteligente"

];

let precio_producto = [1000, 1400, 350, 800, 799, 999];
let stock_producto = [30, 35, 25, 12, 11, 9];


const nombres_productos_random = nombre_producto[Math.floor(Math.random() * nombre_producto.length)];
const precio_productos_random = precio_producto[Math.floor(Math.random() * precio_producto.length)];
const stock_producto_random = stock_producto[Math.floor(Math.random() * stock_producto.length)];


const cliente_Id = 2;
const producto_Id = 31;
const cantidad_productos = 2;
const precioUnitario = 80;

const totalVenta = cantidad_productos * precioUnitario;


try {

  const clientes = coleccion_clientes.findOne({ _id: cliente_Id });


  if (!clientes) {

    coleccion_clientes.insertOne({

      "_id": cliente_Id,
      "nombre": "Samuel Hernandez Santisteban",
      "email": "samuel@example.com",
      "direccion": "nicaragua 49",

    });
    console.error("no existe el id del cliente");
  }


  const productos = coleccion_productos.findOne({ _id: producto_Id });


  if (!productos) {

    console.log("no existe el id del producto");

    coleccion_productos.insertOne({

      "_id": producto_Id,
      "nombre": nombres_productos_random,
      "categoria": 'Electrónica',
      "precio": precio_productos_random,
      "stock": stock_producto_random
    });

    coleccion_productos.updateOne({ _id: producto_Id }, { $inc: { stock: -1 } })

  } else {

    if (productos.stock < cantidad_productos) {
      console.error(`Stock insuficiente para el producto ${producto._id}.`);
      console.error("No se puede procesar el pedido debido a stock insuficiente.");
      session.abortTransaction();
    } else {

      coleccion_productos.updateOne({ _id: producto_Id }, { $inc: { stock: -1 } })

    }

  }

  coleccion_pedidos.insertOne({
    "cliente_id": cliente_Id,
    "producto_id": producto_Id,
    "cantidad": cantidad_productos,
    fecha_pedido: new Date()
  });

  coleccion_auditoria.insertOne(
    {

      "producto_id": producto_Id,
      "cantidad": cantidad_productos,
      "precio_unitario": precioUnitario,
      "total_venta": totalVenta,
      "fecha_venta": new Date()

    })


  session.commitTransaction();
  console.log("Operaciones completadas correctamente.");


} catch (error) {
  console.error("Error al procesar el pedido:", error);
  session.abortTransaction();
} finally {
  session.endSession();






}











