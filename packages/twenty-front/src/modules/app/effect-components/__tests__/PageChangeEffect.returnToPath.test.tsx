import { MockedProvider } from '@apollo/client/testing/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Headers, Request, Response } from 'cross-fetch';
import { createStore, Provider } from 'jotai';
import {
  BrowserRouter,
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';

import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { useReturnToPath } from '@/auth/hooks/useReturnToPath';
import {
  currentWorkspaceState,
  type CurrentWorkspace,
} from '@/auth/states/currentWorkspaceState';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { MinimalMetadataGate } from '@/metadata-store/components/MinimalMetadataGate';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
import {
  NavigationMenuItemType,
  OnboardingStatus,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

// Only surrounding workspace readiness, remote data and record/focus effects are
// replaced. Capture, validation, decision, atom access and navigation stay real.
jest.mock('@/auth/hooks/useHasAccessTokenPair');
jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace');
jest.mock('@/onboarding/hooks/useOnboardingStatus');
jest.mock('@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo', () => ({
  useIsWorkspaceActivationStatusEqualsTo: () => false,
}));
jest.mock('@/navigation/hooks/useDefaultHomePagePath', () => ({
  useDefaultHomePagePath: jest.fn(),
}));
// Keep the real gate's readiness branch and Outlet; omit unrelated visual and
// chip-generation providers, not router scheduling or metadata state.
jest.mock('~/loading/components/UserOrMetadataLoader', () => ({
  UserOrMetadataLoader: () => <div>Metadata pending</div>,
}));
jest.mock(
  '@/object-metadata/components/PreComputedChipGeneratorsProvider',
  () => ({
    PreComputedChipGeneratorsProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => children,
  }),
);
jest.mock('@/app/hooks/useExecuteTasksOnAnyLocationChange', () => ({
  useExecuteTasksOnAnyLocationChange: () => ({
    executeTasksOnAnyLocationChange: jest.fn(),
  }),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => undefined }),
);
jest.mock(
  '@/object-record/record-board/hooks/useActiveRecordBoardCard',
  () => ({
    useActiveRecordBoardCard: () => ({ deactivateBoardCard: jest.fn() }),
  }),
);
jest.mock(
  '@/object-record/record-board/hooks/useFocusedRecordBoardCard',
  () => ({
    useFocusedRecordBoardCard: () => ({ unfocusBoardCard: jest.fn() }),
  }),
);
jest.mock(
  '@/object-record/record-board/hooks/useResetRecordBoardSelection',
  () => ({
    useResetRecordBoardSelection: () => ({
      resetRecordBoardSelection: jest.fn(),
    }),
  }),
);
jest.mock(
  '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex',
  () => ({
    useResetFocusStackToRecordIndex: () => ({
      resetFocusStackToRecordIndex: jest.fn(),
    }),
  }),
);
jest.mock(
  '@/object-record/record-table/hooks/internal/useResetTableRowSelection',
  () => ({
    useResetTableRowSelection: () => ({ resetTableRowSelection: jest.fn() }),
  }),
);
jest.mock('@/object-record/record-table/hooks/useActiveRecordTableRow', () => ({
  useActiveRecordTableRow: () => ({ deactivateRecordTableRow: jest.fn() }),
}));
jest.mock(
  '@/object-record/record-table/hooks/useFocusedRecordTableRow',
  () => ({
    useFocusedRecordTableRow: () => ({ unfocusRecordTableRow: jest.fn() }),
  }),
);
jest.mock(
  '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell',
  () => ({
    useOpenNewRecordTitleCell: () => ({ openNewRecordTitleCell: jest.fn() }),
  }),
);
jest.mock('@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem', () => ({
  useResetFocusStackToFocusItem: () => ({
    resetFocusStackToFocusItem: jest.fn(),
  }),
}));

const target = '/settings/accounts?tab=emails&filter=unread#inbox';

const Diagnostic = ({ ingress }: { ingress?: string }) => {
  const location = useLocation();
  const decision = usePageChangeEffectNavigateLocation();
  const { saveReturnToPath } = useReturnToPath();

  return (
    <>
      <PageChangeEffect />
      <output data-testid="location">
        {location.pathname}
        {location.search}
        {location.hash}
      </output>
      <output data-testid="decision">{decision}</output>
      <button onClick={() => saveReturnToPath(ingress ?? '')}>
        Save ingress
      </button>
    </>
  );
};

describe('PageChangeEffect return-path integration', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    localStorage.clear();
    store = createStore();
    store.set(isAppEffectRedirectEnabledState.atom, true);
    jest.mocked(useHasAccessTokenPair).mockReturnValue(false);
    jest
      .mocked(useIsCurrentLocationOnAWorkspace)
      .mockReturnValue({ isOnAWorkspace: true });
    jest.mocked(useOnboardingStatus).mockReturnValue(undefined);
    jest.mocked(useDefaultHomePagePath).mockReturnValue({
      defaultHomePagePath: '/objects/companies',
    });
  });

  const mount = (path = target, ingress?: string) => {
    window.history.replaceState(null, '', path);
    return render(
      <Provider store={store}>
        <MockedProvider>
          <BrowserRouter>
            <Diagnostic ingress={ingress} />
          </BrowserRouter>
        </MockedProvider>
      </Provider>,
    );
  };

  const ready = (status = OnboardingStatus.COMPLETED) => {
    jest.mocked(useHasAccessTokenPair).mockReturnValue(true);
    jest.mocked(useOnboardingStatus).mockReturnValue(status);
    // Decision only requires workspace presence; remote workspace loading is a boundary.
    store.set(currentWorkspaceState.atom, {
      id: 'fixture-workspace',
    } as CurrentWorkspace);
  };

  it('captures full browser path and keeps it through incomplete readiness', () => {
    const view = mount();
    expect(screen.getByTestId('location')).toHaveTextContent('/welcome');
    expect(store.get(returnToPathState.atom)).toBe(target);
    act(() => {
      jest.mocked(useHasAccessTokenPair).mockReturnValue(true);
    });
    view.rerender(
      <Provider store={store}>
        <MockedProvider>
          <BrowserRouter>
            <Diagnostic />
          </BrowserRouter>
        </MockedProvider>
      </Provider>,
    );
    expect(store.get(returnToPathState.atom)).toBe(target);
    expect(window.location.pathname).toBe('/welcome');
  });

  it('does not consume a computed return destination while redirects are disabled', () => {
    mount();
    act(() => {
      store.set(isAppEffectRedirectEnabledState.atom, false);
      ready();
    });
    expect(screen.getByTestId('decision')).toHaveTextContent(target);
    expect(window.location.pathname).toBe('/welcome');
    expect(store.get(returnToPathState.atom)).toBe(target);
    const push = jest.spyOn(window.history, 'pushState');
    act(() => {
      store.set(isAppEffectRedirectEnabledState.atom, true);
    });
    expect(screen.getByTestId('location').textContent).toBe(target);
    expect(
      window.location.pathname + window.location.search + window.location.hash,
    ).toBe(target);
    expect(store.get(returnToPathState.atom)).toBe('');
    expect(push).toHaveBeenCalledTimes(1);
    act(() => {
      store.set(isAppEffectRedirectEnabledState.atom, false);
    });
    act(() => {
      store.set(isAppEffectRedirectEnabledState.atom, true);
    });
    expect(push).toHaveBeenCalledTimes(1);
    push.mockRestore();
  });

  it('prioritizes required onboarding without discarding the pending destination', () => {
    mount();
    act(() => {
      ready(OnboardingStatus.PROFILE_CREATION);
    });
    expect(window.location.pathname).toBe('/create/profile');
    expect(store.get(returnToPathState.atom)).toBe(target);
  });

  it('acknowledges an exact committed destination only when redirects are enabled', () => {
    ready();
    store.set(returnToPathState.atom, target);
    store.set(isAppEffectRedirectEnabledState.atom, false);
    mount(target);
    expect(store.get(returnToPathState.atom)).toBe(target);
    act(() => store.set(isAppEffectRedirectEnabledState.atom, true));
    expect(store.get(returnToPathState.atom)).toBe('');
  });

  it.each([
    '/settings/accounts',
    '/settings/accounts?tab=emails&filter=unread',
    '/settings/accounts?tab=emails&filter=unread#other',
  ])('does not acknowledge a partial destination match at %s', (location) => {
    ready();
    store.set(returnToPathState.atom, target);
    mount(location);
    expect(store.get(returnToPathState.atom)).toBe(target);
    act(() => {
      window.history.pushState(null, '', target);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(store.get(returnToPathState.atom)).toBe('');
  });

  it('uses a replacement target after disabled redirects and remount', () => {
    const view = mount();
    act(() => store.set(isAppEffectRedirectEnabledState.atom, false));
    view.unmount();
    expect(store.get(returnToPathState.atom)).toBe(target);
    const replacement = '/settings/profile?section=name#details';
    store.set(returnToPathState.atom, replacement);
    ready();
    mount('/welcome');
    expect(store.get(returnToPathState.atom)).toBe(replacement);
    act(() => store.set(isAppEffectRedirectEnabledState.atom, true));
    expect(screen.getByTestId('location').textContent).toBe(replacement);
    expect(store.get(returnToPathState.atom)).toBe('');
  });

  it.each([
    'https://evil.example/path',
    '//evil.example/path',
    '/\\evil.example',
    '/',
    '/welcome',
    '/create/profile',
  ])('rejects invalid ingress %s via the real return hook', (ingress) => {
    mount('/welcome', ingress);
    act(() => {
      screen.getByText('Save ingress').click();
    });
    expect(store.get(returnToPathState.atom)).toBe('');
  });

  it.each([
    'https://evil.example/path',
    '//evil.example/path',
    '/welcome',
    '/create/profile',
  ])(
    'rejects URL-query ingress %s via the real navigation decision',
    (ingress) => {
      ready();
      mount(`/welcome?returnToPath=${encodeURIComponent(ingress)}`);
      expect(window.location.pathname).toBe('/objects/companies');
      expect(store.get(returnToPathState.atom)).toBe('');
    },
  );

  it('retains query and hash from valid URL-query ingress', () => {
    ready();
    mount(`/welcome?returnToPath=${encodeURIComponent(target)}`);
    expect(screen.getByTestId('location').textContent).toBe(target);
    expect(store.get(returnToPathState.atom)).toBe('');
  });
});

describe('PageChangeEffect production-style data-router boundary', () => {
  const webGlobals = {
    Headers: globalThis.Headers,
    Request: globalThis.Request,
    Response: globalThis.Response,
  };

  beforeAll(() => {
    // jsdom lacks Fetch constructors. Use the existing locked dependency, not a
    // fake router Request or a configuration/dependency change.
    Object.assign(globalThis, { Headers, Request, Response });
  });

  afterAll(() => {
    Object.assign(globalThis, webGlobals);
  });

  beforeEach(() => {
    localStorage.clear();
    jest
      .mocked(useHasAccessTokenPair)
      .mockImplementation(
        jest.requireActual('@/auth/hooks/useHasAccessTokenPair')
          .useHasAccessTokenPair,
      );
    jest
      .mocked(useOnboardingStatus)
      .mockImplementation(
        jest.requireActual('@/onboarding/hooks/useOnboardingStatus')
          .useOnboardingStatus,
      );
    jest
      .mocked(useDefaultHomePagePath)
      .mockImplementation(
        jest.requireActual('@/navigation/hooks/useDefaultHomePagePath')
          .useDefaultHomePagePath,
      );
    jest
      .mocked(useIsCurrentLocationOnAWorkspace)
      .mockReturnValue({ isOnAWorkspace: true });
  });

  it.each([
    '/settings/accounts',
    '/settings/accounts?tab=emails&filter=unread',
    target,
  ])(
    'keeps %s after auth publication and independent metadata readiness',
    async (destination) => {
      const store = createStore();
      store.set(isAppEffectRedirectEnabledState.atom, true);
      store.set(isMinimalMetadataReadyState.atom, false);
      for (const name of [
        'objectMetadataItems',
        'navigationMenuItems',
      ] as const) {
        store.set(metadataStoreState.atomFamily(name), {
          current: [],
          draft: [],
          status: 'empty',
        });
      }
      window.history.replaceState(null, '', destination);

      const observations: unknown[] = [];
      const pending = () => {
        let release!: () => void;
        const promise = new Promise<void>((resolve) => {
          release = resolve;
        });
        return { promise, release };
      };
      const userResponse = pending();
      const minimalResponse = pending();
      const objectResponse = pending();
      const menuResponse = pending();
      const returnValues: string[] = [];
      const acknowledgments: string[] = [];
      const unsubscribeReturn = store.sub(returnToPathState.atom, () => {
        returnValues.push(store.get(returnToPathState.atom));
        if (store.get(returnToPathState.atom) === '') {
          acknowledgments.push(
            router.state.location.pathname +
              router.state.location.search +
              router.state.location.hash,
          );
        }
      });
      const Boundary = () => {
        const location = useLocation();
        const { defaultHomePagePath } = useDefaultHomePagePath();
        observations.push({
          location: location.pathname + location.search + location.hash,
          returnTo: store.get(returnToPathState.atom),
          home: defaultHomePagePath,
          minimal: store.get(isMinimalMetadataReadyState.atom),
          objects: store.get(
            metadataStoreState.atomFamily('objectMetadataItems'),
          ).status,
          menu: store.get(metadataStoreState.atomFamily('navigationMenuItems'))
            .status,
        });
        return (
          <>
            <PageChangeEffect />
            <output data-testid="home">{defaultHomePagePath}</output>
            <Outlet />
          </>
        );
      };

      // useCreateWorkspaceAppRouter:133–139 has this async root loader,
      // providers above the protected gate, and a welcome sibling outside it.
      // No target loader is invented and no navigation is manually competed.
      const router = createBrowserRouter([
        {
          element: <Boundary />,
          loader: async () => Promise.resolve(null),
          children: [
            { path: '/welcome', element: <div>Credential boundary</div> },
            {
              element: <MinimalMetadataGate />,
              children: [
                { path: '/', element: <div>Index</div> },
                { path: '/settings/*', element: <div>Settings</div> },
                {
                  path: '/objects/:objectNamePlural',
                  element: <div>Records</div>,
                },
              ],
            },
          ],
        },
      ]);
      const unsubscribeRouter = router.subscribe((state) => {
        observations.push({
          router:
            state.location.pathname +
            state.location.search +
            state.location.hash,
          navigating: state.navigation.location?.pathname,
          returnTo: store.get(returnToPathState.atom),
        });
      });
      const push = jest.spyOn(window.history, 'pushState');
      const view = render(
        <Provider store={store}>
          <MockedProvider>
            <RouterProvider router={router} />
          </MockedProvider>
        </Provider>,
      );

      try {
        await waitFor(() =>
          expect(router.state.location.pathname).toBe('/welcome'),
        );
        expect(store.get(returnToPathState.atom)).toBe(destination);

        // useAuth:277–286 publishes tokens, disables redirects, awaits current
        // user/workspace loading, then enables redirects. This tests those real
        // atom publications, NOT credential mutations or useLoadCurrentUser.
        const authenticate = async () => {
          store.set(tokenPairState.atom, {
            accessOrWorkspaceAgnosticToken: {
              token: 'fixture-access',
              expiresAt: '2099-01-01T00:00:00.000Z',
            },
            refreshToken: {
              token: 'fixture-refresh',
              expiresAt: '2099-01-01T00:00:00.000Z',
            },
          });
          store.set(isAppEffectRedirectEnabledState.atom, false);
          await userResponse.promise;
          store.set(currentUserState.atom, {
            ...mockedUserData,
            onboardingStatus: OnboardingStatus.COMPLETED,
          });
          store.set(
            currentUserWorkspaceState.atom,
            mockedUserData.currentUserWorkspace,
          );
          store.set(currentWorkspaceState.atom, {
            id: 'fixture-workspace',
          } as CurrentWorkspace);
          store.set(isAppEffectRedirectEnabledState.atom, true);
        };
        let authentication!: Promise<void>;
        act(() => {
          authentication = authenticate();
        });
        expect(store.get(returnToPathState.atom)).toBe(destination);
        await act(async () => {
          userResponse.release();
          await authentication;
        });
        await waitFor(() => expect(router.state.navigation.state).toBe('idle'));
        expect(acknowledgments).toEqual([destination]);
        expect(
          router.state.location.pathname +
            router.state.location.search +
            router.state.location.hash,
        ).toBe(destination);
        expect(screen.getByTestId('home').textContent).toBe('/');

        const releaseMetadata = async (
          response: ReturnType<typeof pending>,
          publish: () => void,
        ) => {
          const publication = response.promise.then(publish);
          await act(async () => {
            response.release();
            await publication;
          });
          await waitFor(() =>
            expect(router.state.navigation.state).toBe('idle'),
          );
        };
        await releaseMetadata(minimalResponse, () =>
          store.set(isMinimalMetadataReadyState.atom, true),
        );
        const company = getMockObjectMetadataItemOrThrow('company');
        const dashboard = {
          ...getMockObjectMetadataItemOrThrow('dashboard'),
          isActive: true,
          isSystem: false,
        };
        await releaseMetadata(objectResponse, () =>
          setTestObjectMetadataItemsInMetadataStore(store, [
            company,
            dashboard,
          ]),
        );
        expect(screen.getByTestId('home').textContent).toBe('/');
        await releaseMetadata(menuResponse, () =>
          store.set(metadataStoreState.atomFamily('navigationMenuItems'), {
            current: [
              {
                id: 'fixture-company-menu',
                type: NavigationMenuItemType.OBJECT,
                targetObjectMetadataId: company.id,
                position: 0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            ],
            draft: [],
            status: 'up-to-date',
          }),
        );
        expect(screen.getByTestId('home').textContent).toBe(
          '/objects/dashboards',
        );

        // The CI failures-only reporter suppresses console.info; keep this
        // bounded public-state diagnostic visible in the captured command log.
        process.stdout.write(
          'return-path data-router observation ' +
            JSON.stringify({
              destination,
              observations,
              returnValues,
              pushes: push.mock.calls.map((call) => call[2]),
              final: window.location.href,
            }) +
            '\n',
        );
        expect(returnValues).toEqual([destination, '']);
        expect(acknowledgments).toEqual([destination]);
        expect(push.mock.calls.map((call) => call[2])).toEqual([
          '/welcome',
          destination,
        ]);
        expect(
          router.state.location.pathname +
            router.state.location.search +
            router.state.location.hash,
        ).toBe(destination);
        expect(
          window.location.pathname +
            window.location.search +
            window.location.hash,
        ).toBe(destination);
      } finally {
        view.unmount();
        unsubscribeRouter();
        unsubscribeReturn();
        router.dispose();
        push.mockRestore();
      }
    },
  );
});
