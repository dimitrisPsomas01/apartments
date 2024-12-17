const { express } = require('./index');
const router = require('./routes');

const app = express();

//CREATING MODELS ACCOSSIATIONS
require('./models');

//DATABASE SETTINGS
require('./database');

//MIDDLEWARES
app.use(express.json());

//ROUTES
app.use('/', router);

//STARTING SERVER
port = process.env.PORT;
app.listen(port, () =>
{
    console.log(`App running on port: ${port}...`);
});

