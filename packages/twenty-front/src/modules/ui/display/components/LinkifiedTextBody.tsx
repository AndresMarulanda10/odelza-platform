import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import Linkify from 'linkify-react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { AnimatedEaseInOut } from 'twenty-ui/layout';

const StyledTextBody = styled(motion.div)`
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  margin-top: ${odelzaThemeCssVariables.spacing[4]};
  overflow-wrap: break-word;
  white-space: pre-line;

  a {
    color: ${odelzaThemeCssVariables.font.color.link};
    text-decoration: underline;

    &:hover {
      text-decoration-color: ${odelzaThemeCssVariables.font.color.link};
    }
  }
`;

type LinkifiedTextBodyProps = {
  body: string;
  isDisplayed: boolean;
};

export const LinkifiedTextBody = ({
  body,
  isDisplayed,
}: LinkifiedTextBodyProps) => {
  return (
    <AnimatedEaseInOut isOpen={isDisplayed} duration="fast">
      <StyledTextBody>
        <Linkify
          options={{
            target: '_blank',
            rel: 'noopener noreferrer',
          }}
        >
          {body}
        </Linkify>
      </StyledTextBody>
    </AnimatedEaseInOut>
  );
};
