#!/bin/bash


open_terminal() {
    local CMD="$1"
    local GEOMETRY="$2" 
    gnome-terminal --geometry="$GEOMETRY" -- bash -c "$CMD"
}

# Commands
CMD1="mn --controller=remote,ip=127.0.0.1 --mac --switch=ovsk,protocols=OpenFlow13 --topo=single,4; exec bash"
CMD2="sleep 5 && ryu-manager ryu.app.simple_switch_13 ryu.app.ofctl_rest; exec bash"
CMD3="sleep 5; ovs-ofctl monitor s1 -O OpenFlow13; exec bash"
CMD4="sleep 10 && node index.js; exec bash" 


open_terminal "$CMD1" "80x24+0+0"         # Top-left
open_terminal "$CMD2" "80x24-0+0"        # Top-right
open_terminal "$CMD3" "80x24+0-0"        # Bottom-left
open_terminal "$CMD4" "80x24-0-0"        # Bottom-right