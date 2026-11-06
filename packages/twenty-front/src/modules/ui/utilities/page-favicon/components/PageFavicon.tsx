import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getImageAbsoluteURI } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const DEFAULT_FAVICON = '/images/odelza/favicon.ico';

export const PageFavicon = () => {
  const workspacePublicData = useAtomStateValue(workspacePublicDataState);
  return (
    <Helmet>
      <link
        rel="icon"
        type="image/x-icon"
        href={
          workspacePublicData?.logo
            ? (getImageAbsoluteURI({
                imageUrl: workspacePublicData.logo,
                baseUrl: REACT_APP_SERVER_BASE_URL,
              }) ?? DEFAULT_FAVICON)
            : DEFAULT_FAVICON
        }
      />
    </Helmet>
  );
};
