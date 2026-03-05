## High Priority
- [ ] Input Manager (doing)
- [ ] Node Selector (UI for selecting node types)
- [ ] Save Node Scene
- [ ] Load Node Scene

## Medium Priority
- [ ] Node Interpreter Server
    - Take Node Scene file and parse it to whatever it is supposed to
    - Default Node Classes (so nodes can be loaded but not parsed to a custom type)
        - Node Connection Controller (maybe)
        - Net Forward


## Low Priority
- [ ] Server -> Client communication
    - for "animations"
    - custom displays inside nodes (ex: image output from a Conv2D, output value from node server-side node)
- [ ] Stop Motion Mode
    - Pauses Net Forward and waits for the client to continue

- [ ] NodeType file editor

## Quality of Life (Unordered)
- [ ] Copying and pasting nodes
- [ ] Node "Circuits"
    - Save some Node configuration as a Circuit so you can just paste the Circuit anywhere you need
    - Changes on the main Circuit updates on every single Circuit (maybe)
- [ ] Connection Path Edit
    - Move bezier points from the Connection Path
