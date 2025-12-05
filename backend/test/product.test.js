const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); // Assuming your main app file is server.js
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Product API', () => {
  let adminToken;
  let regularUserToken;
  let adminUser;
  let regularUser;
  let testProduct;

  before(async () => {
    // Connect to a test database (or clear current for testing)
    await mongoose.connection.dropDatabase();

    // Create an admin user
    adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpassword',
      phone: '1234567890',
      role: 'admin'
    });
    await adminUser.save();
    adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);

    // Create a regular user
    regularUser = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'userpassword',
      phone: '0987654321',
      role: 'customer'
    });
    await regularUser.save();
    regularUserToken = jwt.sign({ userId: regularUser._id }, process.env.JWT_SECRET);

    // Create a test product
    testProduct = new Product({
      name: 'Test Potato',
      description: 'A delicious test potato.',
      price: 1000,
      category: 'fresh',
      weight: '1kg',
      stock: 10,
      images: [],
      origin: 'Test Farm'
    });
    await testProduct.save();
  });

  after(async () => {
    // Clean up after tests
    await mongoose.connection.dropDatabase();
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const res = await chai.request(app).get('/api/products');
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.products).to.be.an('array');
      expect(res.body.products).to.have.lengthOf.at.least(1);
    });

    it('should get a single product by ID', async () => {
      const res = await chai.request(app).get(`/api/products/${testProduct._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.name).to.equal(testProduct.name);
    });

    it('should return 404 for non-existent product ID', async () => {
      const res = await chai.request(app).get('/api/products/60d5ec49f873c10015f8c6d1'); // Non-existent ID
      expect(res).to.have.status(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product as admin', async () => {
      const newProduct = {
        name: 'New Potato',
        description: 'Newly added potato.',
        price: 1500,
        category: 'fresh',
        weight: '2kg',
        stock: 5,
        images: ['http://example.com/image.jpg'],
        origin: 'Another Farm'
      };
      const res = await chai.request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);
      
      expect(res).to.have.status(201);
      expect(res.body).to.be.an('object');
      expect(res.body.name).to.equal(newProduct.name);
    });

    it('should return 403 if not admin', async () => {
      const newProduct = {
        name: 'Unauthorized Potato',
        description: 'Attempt to add potato without admin role.',
        price: 1000,
        category: 'fresh',
        weight: '1kg',
        stock: 1,
        images: [],
        origin: 'Farm'
      };
      const res = await chai.request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(newProduct);
      
      expect(res).to.have.status(403);
    });

    it('should return 401 if no token provided', async () => {
      const newProduct = {
        name: 'No Token Potato',
        description: 'Attempt to add potato without token.',
        price: 1000,
        category: 'fresh',
        weight: '1kg',
        stock: 1,
        images: [],
        origin: 'Farm'
      };
      const res = await chai.request(app)
        .post('/api/products')
        .send(newProduct);
      
      expect(res).to.have.status(401);
    });

    it('should return 400 for invalid product data', async () => {
      const invalidProduct = {
        name: 'Invalid',
        description: 'Missing price',
        category: 'fresh'
        // Missing price, which is required
      };
      const res = await chai.request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct);
      
      expect(res).to.have.status(400);
      expect(res.body.message).to.include('"price" is required');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product as admin', async () => {
      const updatedData = { price: 1200, stock: 15 };
      const res = await chai.request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body.price).to.equal(updatedData.price);
      expect(res.body.stock).to.equal(updatedData.stock);
    });

    it('should return 403 if not admin', async () => {
      const updatedData = { price: 1300 };
      const res = await chai.request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updatedData);
      
      expect(res).to.have.status(403);
    });

    it('should return 401 if no token provided', async () => {
      const updatedData = { price: 1300 };
      const res = await chai.request(app)
        .put(`/api/products/${testProduct._id}`)
        .send(updatedData);
      
      expect(res).to.have.status(401);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdate = { price: 'not-a-number' };
      const res = await chai.request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdate);
      
      expect(res).to.have.status(400);
      expect(res.body.message).to.include('"price" must be a number');
    });

    it('should return 404 for updating non-existent product', async () => {
      const updatedData = { price: 999 };
      const res = await chai.request(app)
        .put('/api/products/60d5ec49f873c10015f8c6d1') // Non-existent ID
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      
      expect(res).to.have.status(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product as admin', async () => {
      const res = await chai.request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Product removed');

      // Verify product is actually deleted
      const fetchRes = await chai.request(app).get(`/api/products/${testProduct._id}`);
      expect(fetchRes).to.have.status(404);
    });

    it('should return 403 if not admin', async () => {
      const res = await chai.request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`);
      
      expect(res).to.have.status(403);
    });

    it('should return 401 if no token provided', async () => {
      const res = await chai.request(app)
        .delete(`/api/products/${testProduct._id}`);
      
      expect(res).to.have.status(401);
    });

    it('should return 404 for deleting non-existent product', async () => {
      const res = await chai.request(app)
        .delete('/api/products/60d5ec49f873c10015f8c6d1') // Non-existent ID
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res).to.have.status(404);
    });
  });
});