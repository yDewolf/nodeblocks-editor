import { createContext, ParentComponent, useContext } from "solid-js";
import { PackageManager } from '../engine/packages/package-manager';
import { TypeSpecRegistry } from "../engine/type-registry";

const PackageManagerContext = createContext<PackageManager>();

export const PackageManagerProvider: ParentComponent<{
    packageManager?: PackageManager,
}> = (props) => {
    const packageManager = props.packageManager ?? new PackageManager(new TypeSpecRegistry());
    return (
        <PackageManagerContext.Provider value={packageManager}>
            {props.children}
        </PackageManagerContext.Provider>
    );
};

export const usePackageManager = () => {
    const context = useContext(PackageManagerContext);
    if (!context) {
        throw new Error("usePackageManager must be used within an PackageManagerProvider");
    }
    return context;
};
