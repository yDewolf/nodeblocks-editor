export class GraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DuplicateNodeUIDError extends GraphError {
  constructor(public readonly nodeId: string) {
    super(`Node with uid '${nodeId}' already exists.`);
  }
}

export class ConnectionValidationError extends GraphError {}

export class DuplicateConnectionError extends ConnectionValidationError {
  constructor(
    public readonly fromNodeId: string,
    public readonly fromSlotId: string,
    public readonly toNodeId: string,
    public readonly toSlotId: string
  ) {
    super(
      `Connection already exists between '${fromNodeId}:${fromSlotId}' and '${toNodeId}:${toSlotId}'.`
    );
  }
}

export class MaxConnectionReached extends ConnectionValidationError {
  constructor(
    public readonly fromNodeId: string,
    public readonly fromSlotId: string,
    public readonly toNodeId: string,
    public readonly toSlotId: string
  ) {
    super(
      `Cannot connect '${fromNodeId}:${fromSlotId}' to '${toNodeId}:${toSlotId}': maximum connection limit reached.`
    );
  }
}

export class IncompatibleSlotsError extends ConnectionValidationError {
  constructor(
    public readonly fromNodeId: string,
    public readonly fromSlotId: string,
    public readonly toNodeId: string,
    public readonly toSlotId: string,
    public readonly fromDatatypeId: string,
    public readonly toDatatypeId: string
  ) {
    super(
      `Cannot connect slot of type '${fromDatatypeId}' to slot of type '${toDatatypeId}'.`
    );
  }
}
