const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const { connectDB, sequelize } = require('./utils/db_pg');

async function migrate() {
    await connectDB();

    const jsonPath = path.join(__dirname, 'data/users.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('users.json not found');
        return;
    }

    const raw = fs.readFileSync(jsonPath);
    const data = JSON.parse(raw);
    const users = data.users || [];

    for (const u of users) {
        try {
            const exists = await User.findOne({ where: { username: u.username } });
            if (!exists) {
                await User.create({
                    id: u.id, // Keep existing UUID if compatible, or let Postgres gen new one if format differs
                    username: u.username,
                    password: u.password,
                    role: u.role,
                    pfxPath: u.pfx, // Map json 'pfx' to Model 'pfxPath'
                    pfxPassword: u.pfxPass // Map json 'pfxPass' to Model 'pfxPassword'
                });
                console.log(`Imported: ${u.username}`);
            } else {
                console.log(`Skipped (already exists): ${u.username}`);
            }
        } catch (err) {
            console.error(`Failed to import ${u.username}:`, err.message);
        }
    }
    console.log('Migration complete. You can clean up this script now.');
    process.exit();
}

migrate();
