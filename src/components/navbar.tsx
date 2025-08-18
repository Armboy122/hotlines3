import Link from "next/link";

export default function Navbar(){
    return(
        <nav className="jun-dock bg-white/95 max-w-md  rounded-t-3xl border-gray-200">
          <ul className="jun-dockMenu flex justify-around py-3">
            <li className="jun-dockMenuItem">
              <Link className="jun-dockMenuButton" href={"/"}>
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Link>
            </li>
            <li className="jun-dockMenuItem">
              <Link className="jun-dockMenuButton " href={"/list"}>
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </Link>
            </li>
          </ul>
        </nav>
    )
}