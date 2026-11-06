import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useInView } from 'react-intersection-observer';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';

type CustomResolverFetchMoreLoaderProps = {
  loading: boolean;
  onLastRowVisible: (...args: any[]) => any;
};

const StyledContainer = styled.div`
  min-height: 1px;
`;

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${odelzaThemeCssVariables.grayScale.gray9};
  display: flex;
  height: 32px;
  margin-left: ${odelzaThemeCssVariables.spacing[8]};
  padding-left: ${odelzaThemeCssVariables.spacing[2]};
`;

export const CustomResolverFetchMoreLoader = ({
  loading,
  onLastRowVisible,
}: CustomResolverFetchMoreLoaderProps) => {
  const { ref: tbodyRef } = useInView({
    onChange: (inView) => {
      if (inView) {
        onLastRowVisible();
      }
    },
  });

  return (
    <StyledContainer ref={tbodyRef}>
      {loading && <StyledText>{t`Loading more...`}</StyledText>}
    </StyledContainer>
  );
};
