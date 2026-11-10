import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import Linkify from 'linkify-react';
import { odelzaThemeCssVariables } from 'twenty-ui/theme-constants';
import { AnimatedEaseInOut } from 'twenty-ui/layout';

const StyledThreadMessageBody = styled(motion.div)`
  color: ${odelzaThemeCssVariables.font.color.primary};
  display: flex;
  flex-direction: column;
  margin-top: ${odelzaThemeCssVariables.spacing[4]};
  overflow-wrap: break-word;
  white-space: pre-line;

  a {
    color: ${odelzaThemeCssVariables.font.color.primary};

    text-decoration: underline;
    text-decoration-color: ${odelzaThemeCssVariables.font.color.primary};

    &:hover {
      color: ${odelzaThemeCssVariables.font.color.tertiary};
      text-decoration-color: ${odelzaThemeCssVariables.border.color.strong};
    }
  }
`;

type EmailThreadMessageBodyProps = {
  body: string;
  isDisplayed: boolean;
};

export const EmailThreadMessageBody = ({
  body,
  isDisplayed,
}: EmailThreadMessageBodyProps) => {
  return (
    <AnimatedEaseInOut isOpen={isDisplayed} duration="fast">
      <StyledThreadMessageBody>
        <Linkify
          options={{
            target: '_blank',
            rel: 'noopener noreferrer',
          }}
        >
          {body}
        </Linkify>
      </StyledThreadMessageBody>
    </AnimatedEaseInOut>
  );
};
