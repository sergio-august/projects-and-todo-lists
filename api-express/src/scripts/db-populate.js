"use strict";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const newUser = await prisma.user.create({
        data: {
            name: "Alice",
            email: "alice@prisma.io",
            posts: {
                create: { title: "Hello World", content: "Welcome to Prisma" },
            },
        },
    });
    console.log("Created new user: ", newUser);
}
main()
    .catch((e) => {
    throw e;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=db-populate.js.map