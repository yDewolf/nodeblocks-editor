import { JSXElement, ParentComponent } from "solid-js";
import { HomeLeftTab } from "./components/home-left-tab";
import FileIcon from '~/assets/icons/file.svg';
import DocsIcon from '~/assets/icons/book.svg';
import { useI18n } from "~/i18n/i18n-context";

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
    const { t } = useI18n();
    const routes: HomeRouteConfig[] = [
        {
            iconElement: () => <FileIcon class="smaller-icon" />,
            label: t("routes.scenes"),
            route: "/scenes"
        },
        {
            iconElement: () => <DocsIcon class="smaller-icon"/>,
            label: t("routes.docs"),
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
