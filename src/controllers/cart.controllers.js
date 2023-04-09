const CartServices = require("../services/cart.services");
const ProductsServices = require("../services/products.services");

const addToCart = async (req, res, next) => {
    try {
        const { id: user_id } = req.user
        const { product_id, quantity } = req.body;
        const { stock, price } = await ProductsServices.getOne(product_id);
        const sub_total = price * quantity;

        const data = {
            user_id,
            total: sub_total
        }
        const addNewProduct = async (id) => {
            await CartServices.addProduct({
                cart_id: id,
                product_id,
                quantity,
                sub_total
            })
        }
        // comprobamos si existe el carrito        
        const cart = await CartServices.getByUser(user_id)
        // si no existe...
        if (!cart) {
            //se comprueba stock
            const quantityToAdd = quantity
            if (stock < quantityToAdd) {
                // si stock no disponible, finaliza la operacion
                return next({
                    status: 406,
                    message: "Not acceptable",
                    errorName: "stock no disponible",
                });
            }

            //si pasa la comprobacion del stock, crea el cart
            const newCart = await CartServices.add(data)
            //tomamos el id del cart
            const { id } = newCart
            //registro de producto
            addNewProduct(id)
            // fin
            return res.status(201).json({
                success: true
            });
        }

        const { id : cart_id, total } = cart;
        // si cart existe entonces buscamos el producto
        const findProduct = await CartServices.getProductInCart(cart_id, product_id)

        // si no existe, se crea previamente verificado el stock
        if (!findProduct) {
            const quantityToAdd = quantity
            if (stock < quantityToAdd) {
                return next({
                    status: 406,
                    message: "Not acceptable",
                    errorName: "stock no disponible",
                });
            }

            // se actualiza el cart
            await CartServices.updateCart(cart_id, { total: total + sub_total })
            //agrega el producto
            addNewProduct(cart_id)
            return res.status(201).json({
                success: true
            });
        }

        // si existe el producto, extraemos las propiedades a actualizar
        const { quantity: addQuantity, sub_total: addSubTotal, id: idProductExist } = findProduct;
        //verificamos stock con cantidades a adherir
        const quantityToAdd = quantity + addQuantity
        if (stock < quantityToAdd) {
            return next({
                status: 406,
                message: "Not acceptable",
                errorName: "stock no disponible",
            });
        }

        // si cart existe, y stock disponible actualizamos
        await CartServices.updateCart(cart_id, { total: total + sub_total })

        await CartServices.updateProductInCart(idProductExist, {
            quantity: addQuantity + quantity,
            sub_total: addSubTotal + sub_total,
        })

        res.status(201).json({
            success: true
        });
    } catch (error) {
        next(error)
    }
}

const getCart = async (req, res, next) => {
    const { id: user_id } = req.user;
    try {
        const result = await CartServices.getCartByUser(user_id)
        res.json(result)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addToCart,
    getCart
}