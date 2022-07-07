import Link from 'next/link';
import { BsGithub } from 'react-icons/bs';

export const Footer = () => {
	return (
		<footer className="flex justify-center items-center pb-8 text-sm">
			<Link
				href="https://github.com/salvia-dev/tiktofiy-next"
				aria-label="Go to the GitHub repository"
			>
				<a
					className="flex flex-row justify-between gap-4 p-5"
					rel="noopener noreferrer"
					target="_blank"
				>
					<div className="flex items-center justify-center">
						<BsGithub className="w-6 h-6 fill-sub" />
					</div>
					<div className="flex items-center justify-center text-subactive text-center">
						salvia-dev/tiktofiy-next
					</div>
				</a>
			</Link>
		</footer>
	);
};