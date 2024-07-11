const { PrismaClient } = require("@prisma/client");
const async = require("async");

function runTests() {
    const prisma = new PrismaClient();
    async.series(
        [
            function runTest1(callback) {
                console.log("Running npm run test");
                runCommand("test1", callback);
            },
            function runTest2(callback) {
                console.log("\nRunning npm run test2");
                runCommand("test2", callback);
            },
        ],
        async function (err) {
            if (err) {
                console.error("Error during tests:", err);
            } else {
                await prisma.file.deleteMany();
                await prisma.messageDetails.deleteMany();
                await prisma.message.deleteMany();
                await prisma.chat.deleteMany();
                await prisma.customer.deleteMany();
                await prisma.user.deleteMany();
                await prisma.subTopic.deleteMany();
                await prisma.topic.deleteMany();

                console.log("\nAll tests completed.");
            }
        }
    );
}

function runCommand(command, callback) {
    const { exec } = require("child_process");
    const child = exec(`npm run ${command}`);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on("exit", (code) => {
        if (code === 0) {
            callback(null);
        } else {
            callback(`Test command ${command} failed with exit code ${code}`);
        }
    });
}

runTests();
