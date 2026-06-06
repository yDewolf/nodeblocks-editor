import { PageViewer } from "../components/page-controller"

export const SettingsView = (props: {page_viewer: PageViewer}) => {
    return (
        <div class="container">
            <button onclick={() => {props.page_viewer.current_page = undefined}}>
                x
            </button>
            <h3>Settings</h3>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum vel dolorem, eligendi, ratione perspiciatis explicabo libero autem numquam hic tenetur error culpa debitis dolores nesciunt rerum nulla nemo aspernatur veritatis.
        </div>
    )
}