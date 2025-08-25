{
  description = "Development environment for oddship.github.io";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.npm
          ];

          shellHook = ''
            echo "🚀 Development environment for oddship.github.io"
            echo "Installing dependencies..."
            npm install
            echo "Available commands:"
            echo "  npm run dev    - Start development server"
            echo "  npm run build  - Build the project"
            node --version
            npm --version
          '';
        };
      });
}