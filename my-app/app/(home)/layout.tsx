import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

type TProps = {
  children: React.ReactNode
};

export default function Layout({ children }: TProps) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
