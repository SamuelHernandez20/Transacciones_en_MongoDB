/*
Transacción para una aplicación ficticia de comercio electrónico que gestiona clientes, productos, pedidos y auditoría de transacciones. 
Se ha agregado una nueva funcionalidad para gestionar las devoluciones de productos. Donde se necesita implementar una transacción que maneje el proceso de devolución de un producto comprado.

- Verificar la existencia del cliente y del pedido. 
- Verificar que ese cliente se corresponda especificamente al pedido a devolver. 
- Verificar que la cantidad del producto a devolver, no sea mayor que la cantidad que ha comprado de ese producto.
- Actualizar el stock del producto devuelto. (Incrementado su valor en base a la cantidad de productos devueltos). 
- Seguidamente, restarle a la cantidad de productos pedidos, aquella cantidad de productos que devuelva. 
- Registrar la devolución en la colección devoluciones.
- Commit de la transacción si todas las operaciones son exitosas.
- Abortar la transacción en caso de error.
*/


const session = db.getMongo().startSession()
session.startTransaction()


const col_clientes = session.getDatabase('Comercio').getCollection('clientes');
const col_devoluciones = session.getDatabase('Comercio').getCollection('devoluciones');
const col_pedidos = session.getDatabase('Comercio').getCollection('pedidos');
const col_productos = session.getDatabase('Comercio').getCollection('productos');

// Variables de la solicitud de devolución:

let cliente_que_devuelve = 25;
let pedido_que_devuelve = 123;

let producto_que_devuelve = 31;
let cantidad_que_devuelve = 1;

let motivo_devolucion = "Insatisfecho con la compra realizada.";

let pedido_cantidad_comprada = col_pedidos.findOne({ cliente_id: cliente_que_devuelve });
let pedido_cantidad_campo = pedido_cantidad_comprada.cantidad;

const clientes = col_clientes.findOne({ _id: cliente_que_devuelve });
const pedido = col_pedidos.findOne({ _id: pedido_que_devuelve });

try {

    if (clientes) {

        console.log('Buscando cliente en la base de datos...');
        console.log('Cliente encontrado: ');
        console.log(clientes);

    } else {
        console.error(`No existe el cliente con indentificador: "${cliente_que_devuelve}", que solicita la devolución`);
    }

    if (pedido) {

        console.log('Buscando pedido en la base de datos...');
        console.log('Pedido encontrado: ');
        console.log(pedido);
        
        const cliente_pedido = col_pedidos.findOne({ cliente_id: cliente_que_devuelve });
        const pedido_cliente = col_pedidos.findOne({ cliente_id: cliente_que_devuelve });

        const cliente_id_numerico = cliente_pedido.cliente_id;
        const pedido_id_numerico = pedido_cliente._id;

        if (cliente_id_numerico === cliente_que_devuelve) {

            if (pedido_id_numerico === pedido_que_devuelve) {

                console.log(`El pedido encontrado con identificador "${pedido_que_devuelve}" SI se corresponde con el cliente con identificador: "${cliente_que_devuelve}".`);

            }

        }

    } else {
        console.error(`No existe el pedido  con identificador: "${pedido_que_devuelve}", del que se solicita devolución`);

    }


    if (pedido_cantidad_campo < cantidad_que_devuelve) {
        throw new Error;

    } else {
        col_productos.updateOne({ _id: producto_que_devuelve }, { $inc: { stock: cantidad_que_devuelve } });
        col_pedidos.updateOne({ producto_id: producto_que_devuelve }, { $inc: { cantidad: -cantidad_que_devuelve } });

        col_devoluciones.insertOne({
            "cliente_id": cliente_que_devuelve,
            "pedido_id": pedido_que_devuelve,
            "producto_id": producto_que_devuelve,
            "cantidad_devuelta": cantidad_que_devuelve,
            "motivo_de_devolucion": motivo_devolucion,
            "fecha_devolucion": new Date()

        });
    }

    session.commitTransaction();
    console.log("");
    console.log("Operaciones completadas correctamente.");

} catch (error) {
    console.error("Error, abortando la transacción...", error.menssage);
    session.abortTransaction();
} finally {
    session.endSession();

}


