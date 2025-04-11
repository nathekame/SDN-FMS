require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.KALEIDO_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractABI = [
    {
        "inputs": [
            { "name": "src", "type": "string" },
            { "name": "dest", "type": "string" },
            { "name": "action", "type": "string" },
            { "name": "packetCount", "type": "uint256" },
            { "name": "byteCount", "type": "uint256" }
        ],
        "name": "addFlow",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllFlows",
        "outputs": [
            {
                "components": [
                    { "name": "src", "type": "string" },
                    { "name": "dest", "type": "string" },
                    { "name": "action", "type": "string" },
                    { "name": "packetCount", "type": "uint256" },
                    { "name": "byteCount", "type": "uint256" }
                ],
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const contract = new ethers.Contract(process.env.SMART_CONTRACT_ADDRESS, contractABI, wallet);


async function getOpenFlowRules() {
    try {
        const response = await fetch("http://127.0.0.1:8080/stats/flow/1");

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        return data["1"];
    } catch (error) {
        console.error("\x1b[31m[ERROR] Failed to fetch flow data:\x1b[0m", error);
        return [];
    }
}


async function compareWithKaleido(src, dest, packetCount, byteCount) {
    try {
        const kaleidoData = await contract.getAllFlows();

        if (kaleidoData) {
            console.log(
                `\x1b[32m[INFO] Total Flows in Kaleido:  ${kaleidoData.length }\x1b[0m`
            );
        }

        if (kaleidoData && kaleidoData.length > 0) {
            
            for (const flow of kaleidoData) {
                const kaleidoSrc = flow.src;
                const kaleidoDest = flow.dest;
                const kaleidoPacketCount = parseInt(flow.packetCount, 10);
                const kaleidoByteCount = parseInt(flow.byteCount, 10);

                if (
                    src === kaleidoSrc &&
                    dest === kaleidoDest &&
                    packetCount === kaleidoPacketCount &&
                    byteCount === kaleidoByteCount
                ) {
                    console.log(
                        `\x1b[32m[INFO] Flow ${src} -> ${dest} is consistent with Kaleido.\x1b[0m`
                    );
                    return true; 
                }
            }

            console.log(
                `\x1b[33m[INFO] No matching flow found in Kaleido for ${src} -> ${dest} with the same packetCount and byteCount.\x1b[0m`
            );
            return false; 
        } else {
            console.log(
                `\x1b[31m[ERROR] No flows found in Kaleido to compare against.\x1b[0m`
            );
            return false; 
        }
    } catch (error) {
        console.error(
            `\x1b[31m[ERROR] Failed to compare with Kaleido:\x1b[0m`,
            error.message
        );
        return false; 
    }
}


async function writeFlowsToBlockchain() {
    const flows = await getOpenFlowRules();

    console.log(`\x1b[36m*******************************************************\x1b[0m`);
    console.log(`\x1b[32m[INFO] Starting flow processing at ${new Date().toLocaleTimeString()}\x1b[0m`);
    console.log(`\n\x1b[34m[PROCESSING] Fetching flows...`);
    console.log(`\x1b[36m[INFO] Retrieved ${flows.length} flows from Controller\x1b[0m`);
    console.log(`\x1b[36m*******************************************************\x1b[0m`);

    for (const flow of flows) {
        const src = flow.match["in_port"] ? flow.match["in_port"].toString() : "unknown";
        let dest = "-"; 
        let action = "unknown action"; 
        const packetCount = flow.packet_count || 0;
        const byteCount = flow.byte_count || 0;

        if (flow.actions.length > 0) {
            const actionData = flow.actions[0];

            if (typeof actionData === 'string') {
                const [actionType, actionValue] = actionData.split(":");

                switch (actionType) {
                    case "OUTPUT":
                        dest = actionValue ? actionValue.toString() : "-";
                        action = `Forward to port ${dest}`;
                        break;

                    case "DROP":
                        action = "Drop packet";
                        break;

                    case "CONTROLLER":
                        action = "Send to SDN controller";
                        break;

                    case "SET_FIELD":
                        action = `Modify ${actionData.field} to ${actionData.value}`;
                        break;

                    case "GROUP":
                        action = `Send to multicast/broadcast group ${actionData.group_id}`;
                        break;

                    case "METER":
                        action = `Apply rate-limiting meter ${actionData.meter_id}`;
                        break;

                    case "PUSH_VLAN":
                        action = `Add VLAN tag ${actionData.vlan_id}`;
                        break;

                    case "POP_VLAN":
                        action = "Remove VLAN tag";
                        break;

                    default:
                        action = `Unhandled action type: ${actionType}`;
                        break;
                }
            } else {
                switch (actionData.type) {
                    case "OUTPUT":
                        dest = actionData.port ? actionData.port.toString() : "-";
                        action = `Forward to port ${dest}`;
                        break;

                    case "DROP":
                        action = "Drop packet";
                        break;

                    case "CONTROLLER":
                        action = "Send to SDN controller";
                        break;

                    case "SET_FIELD":
                        action = `Modify ${actionData.field} to ${actionData.value}`;
                        break;

                    case "GROUP":
                        action = `Send to multicast/broadcast group ${actionData.group_id}`;
                        break;

                    case "METER":
                        action = `Apply rate-limiting meter ${actionData.meter_id}`;
                        break;

                    case "PUSH_VLAN":
                        action = `Add VLAN tag ${actionData.vlan_id}`;
                        break;

                    case "POP_VLAN":
                        action = "Remove VLAN tag";
                        break;

                    default:
                        action = `Unhandled action type: ${actionData.type}`;
                        break;
                }
            }
        }

        console.log(`\x1b[33m[FLOW] src: ${src} -> dest: ${dest}`);
        console.log(`        action: ${action}`);
        console.log(`        packet_count: ${packetCount}, byte_count: ${byteCount}\x1b[0m`);

        const isConsistent = await compareWithKaleido(src, dest, packetCount, byteCount);

        if (!isConsistent) {
            try {
                const tx = await contract.addFlow(src, dest, action, packetCount, byteCount);
                console.log(`\x1b[34m[PENDING] Sent transaction. Awaiting confirmation...\x1b[0m`);
                await tx.wait();
                console.log(`\x1b[32m[SUCCESS] Flow added to blockchain! Transaction Hash: ${tx.hash}\x1b[0m`);
            } catch (error) {
                const errorMsg = error?.message?.toLowerCase() || "";

                if (errorMsg.includes("replacement fee too low") || errorMsg.includes("already known")) {
                    console.warn(`\x1b[33m[SKIPPED] Transaction for flow ${src} -> ${dest} is already in mempool or pending.\x1b[0m`);
                } else {
                    console.error("\x1b[31m[ERROR] Blockchain transaction failed:\x1b[0m", error.message);
                }
            }
        } else {
            console.log(`\x1b[36m[INFO] No changes detected for flow ${src} -> ${dest}. Skipping Kaleido blockchain update.\x1b[0m`);
        }
    }

    console.log(`\x1b[32m[INFO] Finished processing all flows at ${new Date().toLocaleTimeString()}\x1b[0m`);
    console.log(`\x1b[36m*******************************************************\x1b[0m`);

}

setInterval(writeFlowsToBlockchain, 1 * 60 * 1000);

writeFlowsToBlockchain();

