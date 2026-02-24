

export class NodeSlot {
    public View() {
        return (
            <div 
                class="slot-container" 
                onPointerDown={(e) => {
                    console.log("hi", this);
                }}
            >
                <div class="slot-dot">
                    {/* <div class="slot-label">bleh</div> */}
                </div>
            </div>
        )
    }
}   