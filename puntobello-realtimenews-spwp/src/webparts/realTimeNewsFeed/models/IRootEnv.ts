import ICustomCSSProperties from "./ICustomCSSProperties";
import ICustomConfigProperties from "./ICustomConfigProperties";

interface IRootEnv {
    css: ICustomCSSProperties;
    config: ICustomConfigProperties;
}

export default IRootEnv