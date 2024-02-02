import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import {co2} from "@tgwf/co2";

const ZatsCO2JSBadge = () => {
    const { colorMode } = useColorMode();
    const swd = new co2();

    // You can also explicitly declare the model
    // const declaredSwd = new co2({ model: "swd" });
    // const oneByte = new co2({ model: "1byte" });
    //const emissionsPerVisit = swd.perVisit(409600);

    const emissions = new co2()
    const bytesSent = (409600)
    const greenHost = false

    let estimatedCO2 = emissions.perByte(bytesSent, greenHost).toFixed(3)
    return (
        <div className="infocontainer">
            <div className={`label${colorMode}`}>g de CO2/vue</div>

            <div className={`value${colorMode}`}><b>{estimatedCO2}</b></div>
        </div>
    );
};
export default ZatsCO2JSBadge;