import { JSXElement, ParentComponent } from "solid-js";
import { useAppSession } from "~/network/app-session-provider"
import { HomeLeftTab } from "./components/home-left-tab";
import FileIcon from '~/assets/icons/file.svg';
import DocsIcon from '~/assets/icons/book.svg';

export const Home: ParentComponent = (props) => {
    return (
        <HomeView>
            {props.children}
        </HomeView>
    )
}

export interface HomeRouteConfig {
    iconElement: () => JSXElement
    label: string
    route: string
}

const HomeView: ParentComponent = (props) => {
    const routes: HomeRouteConfig[] = [
        {
            iconElement: () => <FileIcon class="smaller-icon" />,
            label: "Scenes",
            route: "/scenes"
        },
        {
            iconElement: () => <DocsIcon class="smaller-icon"/>,
            label: "Documentation",
            route: "/docs"
        }
    ]

    return (
        <div class="home-view">
            <HomeLeftTab routes={routes} />
            <div class="home-content-holder fill">
                {props.children}
            </div>
        </div>
    )
}
