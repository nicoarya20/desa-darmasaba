import { spawn } from 'bun';

async function proc(params?: {
    env?: Record<string, string | undefined>;
    cmd?: string;
    cwd?: string;
    timeout?: number;
    exitCode?: number;
    onStdOut?: (chunk: string) => void;
    onStdErr?: (chunk: string) => void;
    onStdio?: (chunk: string) => void;
}) {
    const { env = {}, cmd, cwd = "./", timeout = 600000 } = params || {};
    return new Promise(async (resolve, reject) => {
        if (!cmd || typeof cmd !== "string") {
            return reject(new Error("Invalid or missing command"));
        }

        const std = {
            stdout: "",
            stderr: "",
            stdio: "",
        };

        try {
            // Spawn the child process
            const child = spawn(cmd.split(" "), {
                cwd,
                env: {
                    PATH: process.env.PATH,
                    ...env,
                },
            });

            // Set a timeout to kill the process if it takes too long
            const timeOut = setTimeout(() => {
                try {
                    child.kill();
                } catch (err) {
                    console.warn("Failed to kill child process:", err);
                }
                reject(new Error("Process timed out"));
            }, timeout);

            // Read stdout and stderr as text
            const [stdout, stderr] = await Promise.all([
                readStream(child.stdout),
                child.stderr ? readStream(child.stderr) : undefined,
            ]);

            // Handle stdout
            std.stdout = stdout;
            std.stdio += stdout;
            if (params?.onStdOut) {
                params.onStdOut(stdout.trim());
            }
            if (params?.onStdio) {
                params.onStdio(stdout.trim());
            }

            // Handle stderr
            std.stderr = stderr ?? "";
            std.stdio += stderr;
            if (params?.onStdErr) {
                params.onStdErr((stderr ?? "").trim());
            }
            if (params?.onStdio) {
                params.onStdio((stderr ?? "").trim());
            }

            clearTimeout(timeOut);
            resolve(std);
        } catch (err) {
            reject(err);
        }
    });
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;

    while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
            result += decoder.decode(value, { stream: true });
        }
    }
    result += decoder.decode(); // flush any remaining data
    return result.trim();
}

export default proc;

proc({
    cmd: "bun run build",
    cwd: "./",
    onStdio: (text) => {
        console.log(text.trim());
    }
})