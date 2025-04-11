// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SDNFlows {
    struct Flow {
        string src;
        string dest;
        string action;
        uint packetCount;
        uint byteCount;
    }

    Flow[] public flows;

    event FlowAdded(string src, string dest, string action, uint packetCount, uint byteCount);

    function addFlow(
        string memory src,
        string memory dest,
        string memory action,
        uint packetCount,
        uint byteCount
    ) public {
        flows.push(Flow(src, dest, action, packetCount, byteCount));
        emit FlowAdded(src, dest, action, packetCount, byteCount);
    }

    function getAllFlows() public view returns (Flow[] memory) {
        return flows;
    }
}
