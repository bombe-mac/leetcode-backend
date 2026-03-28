import { createClient } from "redis";

const redisClient = createClient();

async function processSubmission(submission:string){
    const { problemId, code, language } = JSON.parse(submission);
    //here the code will be executed in a container

    //simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Finished processing submission for problemId ${problemId}.`);
}

async function startWorker() {

    try {
        await redisClient.connect();
        console.log("Worker connected to Redis.");

        // Main loop
        while (true) {
            try {
                const submission = await redisClient.brPop("submissions", 0);
                await processSubmission(submission.element);
            } catch (error) {
                console.error("Error processing submission:", error);
                // Implement your error handling logic here. For example, you might want to push
                // the submission back onto the queue or log the error to a file.
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startWorker();