const router = require('express').Router()
const Product = require('../models/Product.model')

router.get('/menu', (req, res, next) => {
  Product.find({}, (err, productList) => {
    if (err) {
      res.status(500).json({message: "Ha ocurrido un error al buscar los productos"})
      return
    }
    if (!productList) {
      res.status(200).json({message: "Aun no hay platos disponibles"})
      return
    }
    res.status(200).json(productList)
  })
})

router.get('/category/:categoryName', async (req, res, next) => {
  try {
    const { categoryName } = req.params
    const currentProducts = await Product.find({category: categoryName})
    
    if (!currentProducts.length) {
      res.status(400).json({message: 'No hay productos con esta categoría.'})
      return
    }

    res.status(200).json(currentProducts)
  } catch (error) {
    res.status(500).json({message: 'Error al buscar los productos por categorías.'})
  }
  
})

router.get('/product/:id', (req, res, next) => {
  const { id } = req.params
  Product.findById(id, (err, product) => {
    if (err) {
      res.status(500).json({message: "Ha ocurrido un error al buscar el producto."})
      return
    }
    if (!product) {
      res.status(400).json({message: "No se encuentra el producto en la base de datos."})
      return
    }
    res.status(200).json(product)
  })
})

router.delete('/deleteproduct/:id', (req, res, next) => {
  const { id } = req.params
  Product.findByIdAndDelete(id, (err, productDeleted) => {
    if (err) {
      res.status(500).json({message: "Ha ocurrido un error al borrar el producto."})
      return
    }
    if (!productDeleted) {
      res.status(404).json({message: "No se encuentra el producto en la base de datos."})
      return
    }
    res.status(200).json(productDeleted)
  })
})

module.exports = router