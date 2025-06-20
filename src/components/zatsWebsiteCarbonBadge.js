import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { WebsiteCarbonBadge } from 'react-websitecarbon-badge';

const ZatsWebsiteCarbonBadge = () => {
    const { colorMode } = useColorMode();
    return (
        <WebsiteCarbonBadge lang="fr" dark={colorMode === 'dark'} url={"https://blog.zatsit.fr/"} />
    );
};
export default ZatsWebsiteCarbonBadge;
