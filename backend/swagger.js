const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Store Management API',
      version: '1.0.0',
      description: 'API for managing store inventory, orders, and user authentication',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        InventoryItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the inventory item'
            },
            name: {
              type: 'string',
              description: 'Name of the inventory item'
            },
            model: {
              type: 'string',
              description: 'Model number or identifier'
            },
            size: {
              type: 'string',
              description: 'Size of the item'
            },
            stockLevel: {
              type: 'integer',
              minimum: 0,
              description: 'Current stock level'
            }
          },
          required: ['name', 'model', 'size', 'stockLevel']
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './index.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 