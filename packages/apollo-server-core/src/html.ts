export const indexHTML = (playgroundPage: string): string => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Apollo Server</title>

    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;900&display=swap"
      rel="stylesheet"
    />

    <script>
      const loadPlayground = () => {
        const src = decodeURI("${encodeURI(playgroundPage)}");
        document.open("text/html");
        document.write(src);
        document.close();
      };

      /**
       * Read the user's preference out of localStorage. We set one preference
       * per URL that the user may have used Apollo Server with.
       **/
      const pref = JSON.parse(localStorage.getItem("apollo-server") || "{}")[
        window.location.origin
      ];

      const savePref = (location, pref) => {
        const preferences = JSON.parse(
          localStorage.getItem("apollo-server") || "{}"
        );
        preferences[location] = pref;
        localStorage.setItem("apollo-server", JSON.stringify(preferences));
      };

      if (pref === "dev-graph") {
        window.location.href = "https://studio.apollographql.com/dev";
      } else if (pref === "playground") {
        loadPlayground();
      }
    </script>
  </head>

  <body>
    <div id="root">
      <style>
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          padding: 0;
          margin: 0;
          overflow: auto;
          height: 100%;
          width: 100%;
          font-family: "Source Sans Pro", sans-serif;
        }

        .page-content {
          display: flex;
          flex-direction: column;
          padding: 80px 40px;
          color: white;
          text-align: center;
          overflow: hidden;
          position: relative;
          min-height: 100%;
          background-image:
            url(https://cdn.glitch.com/f8bd7045-3ef9-406e-bec2-60ab295d8e27%2Fconstellation-bg%402x.png?v=1608237779584),
            linear-gradient(to bottom,#1c153c 27%,#2d1f66);
          background-repeat:
            no-repeat,
            no-repeat;
          background-size:
            2184px 996px,
            100% 100%;
          background-position:
            top center,
            top center;
        }

        .apollo-logo {
          flex: none;
          margin: 0 auto;
          width: 140px;
          height: 140px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        #logo-spin {
          transform-origin: 100px 100px;
          animation: spin 6s linear infinite;
        }

        a {
          font-weight: 600;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }

        a:hover {
          text-decoration: underline;
        }

        label {
          cursor: pointer;
        }

        .planet {
          border-radius: 1750px;
          width: 3500px;
          height: 3500px;
          top: calc(100% - 140px);
          box-shadow: 0 -32px 160px 20px rgba(113,86,217,0.72);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          background-color: #2d1f66;
        }
        @media (max-width: 1000px) {
          .planet {
            border-radius: 1000px;
            width: 2000px;
            height: 2000px;
          }
        }

        .main-content {
          flex: 1;
          margin: 40px auto 90px;
          max-width: 472px;
        }

        .studio-button {
          padding: 13px 34px;
          margin: 40px auto 30px;
          border: none;
          border-radius: 4px;
          background-color: #7156D9;
          color: #ffffff;
          box-shadow:
            0px 1px 4px rgba(18, 21, 26, 0.04),
            inset 0px -1px 0px rgba(18, 21, 26, 0.05),
            inset 0px 0px 0px 1px rgba(18, 21, 26, 0.2);
          font-family: "Source Sans Pro", sans-serif;
          font-size: 19px;
          font-weight: 600;
          line-height: 1.25;
          transition: background-color .1s ease-in-out;
        }

        .studio-button:hover {
          background-color: #3f20ba;
          box-shadow:
            0 0 0 1px rgba(18,21,26,0.2),
            0 5px 10px 0 rgba(18,21,26,0.12),
            0 1px 0 0 rgba(18,21,26,0.05);
          cursor: pointer;
        }

        .intro-paragraph,
        .save-preference-line,
        .footer {
          color: #D9CFFF;
        }

        .intro-paragraph a,
        .footer a {
          color: #41D9D3;
        }

        .intro-paragraph {
          font-size: 15px;
        }

        .save-preference-line {
          font-size: 13px;
        }

        .save-preference-line input,
        .save-preference-line label {
          vertical-align: middle;
        }

        /* checkbox hack - hide existing checkbox */
        .preference-input {
          opacity: 0;
        }

        /* checkbox hack - styling for checked background */
        .preference-input:checked + .preference-label:before {
          background: #7156D9 url('data:image/svg+xml;utf8,<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.8126 1.30032L4.48772 8L1.10602 4.40626" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>') center center no-repeat;
        }

        /* checkbox hack - add space on label for fake checkbox */
        .preference-label {
          position: relative;
          padding-left: 24px;
          cursor: pointer;
        }

        /* checkbox hack - style fake checkbox with pseudo element */
        .preference-label:before {
          content: ' ';
          position: absolute;
          left: 0; top: 0;
          width: 16px; height: 16px;
          border: 1px solid #AD9BF6;
          border-radius: 4px;
        }

        .footer {
          border: 1px solid #7156D9;
          border-radius: 8px;
          padding: 10px;
          width: 386px;
          margin: 0 auto -30px;
          flex: none;
          font-size: 13px;
          position: relative;
          z-index: 2;
        }

        .footer .copy {
          vertical-align: middle;
          line-height: .5;
        }

        .question-icon {
          margin-right: 8px;
          display: inline-block;
          vertical-align: middle;
        }

        #planet {
          position: relative;
          z-index: 1;
        }
      </style>

      <div class="page-content">

        <section class="apollo-logo">
          <svg
            width="140px"
            height="140px"
            viewbox="0 0 240 240"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
          >
            <g transform="translate(20.000000, 20.000000)" fill-rule="nonzero">
              <polygon
                fill="white"
                points="112.4 48.7 88.2 48.7 53.2 139.6 75.1 139.6 80.8 124.2 113.9 124.2 107.9 107.2 86.1 107.2 100.3 68.1 125.5 139.6 147.4 139.6"
              ></polygon>
              <path
                id="logo-spin"
                fill="white"
                d="M196.3,73 C196.2,72.7 196.2,72.4 196,72.1 C196,72 195.9,71.8 195.9,71.8 C195.1,70.1 193.4,68.9 191.4,68.9 C188.6,68.9 186.4,71.1 186.4,73.9 C186.4,74.5 186.5,75 186.7,75.5 L186.7,75.5 C188.9,83.4 190,91.6 190,100 C190,124 180.6,146.6 163.6,163.6 C146.6,180.6 124,190 100,190 C76,190 53.4,180.6 36.4,163.6 C19.4,146.6 10,124 10,100 C10,76 19.4,53.4 36.4,36.4 C53.4,19.4 76,10 100,10 C121.5,10 141.8,17.5 158,31.2 C157.5,32.6 157.2,34.1 157.2,35.7 C157.2,42.5 162.7,47.9 169.4,47.9 C176.2,47.9 181.6,42.4 181.6,35.7 C181.6,29 176.1,23.5 169.4,23.5 C167.9,23.5 166.5,23.8 165.2,24.2 C147.7,9.1 124.9,0 100,0 C44.8,0 0,44.8 0,100 C0,155.2 44.8,200 100,200 C155.2,200 200,155.2 200,100 C200,90.7 198.7,81.6 196.3,73 Z"
              ></path>
            </g>
            <rect
              fill="transparent"
              x="0"
              y="0"
              width="240"
              height="240"
            ></rect>
          </svg>
        </section>

        <section class="main-content">
          <div class="intro-paragraph"> To query your schema, use a Dev Graph in Apollo Studio (recommended)
            or <a id="use-playground" href="#"> GraphQL Playground</a>. Both tools will point to your localhost:4000 and let you query your schema as you make changes.
          </div>
          <button id="use-dev-graph" class="studio-button">
            Continue to Apollo Studio
          </button>
          <div class="save-preference-line">
            <input type="checkbox" id="preference" class="preference-input" />
            <label for="preference" class="preference-label">
              Save this preference for <span id="window-location"></span>
            </label>
          </div>
        </section>

        <section class="footer">
          <svg class="question-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 6.99994C7 5.89528 7.896 4.99994 9.00067 5.00061C10.1053 5.00061 11.0007 5.89661 11 7.00128C11 7.84861 10.4653 8.60394 9.66667 8.88661C9.26667 9.02794 9 9.40594 9 9.82994V10.5006" stroke="#AD9BF6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.00001 12.5C8.86201 12.5 8.75001 12.612 8.75001 12.75C8.75001 12.888 8.86201 13 9.00001 13C9.13801 13 9.25001 12.888 9.25001 12.75C9.25001 12.612 9.13801 12.5 9.00001 12.5V12.5" stroke="#AD9BF6" stroke-linecap="round" stroke-linejoin="round"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9 1C13.4181 1 17 4.58187 17 9C17 13.4181 13.4181 17 9 17C4.58187 17 1 13.4181 1 9C1 4.58187 4.58187 1 9 1Z" stroke="#AD9BF6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          <span class="copy">Learn about <a href="https://www.apollographql.com/docs/react/">Apollo Client</a>, <a href="https://www.apollographql.com/docs/apollo-server/">Apollo Server</a>, and <a href="https://www.apollographql.com/docs/studio/">Apollo Studio</a></span>.
        </section>

        <div class="planet"></div>
      </div>
    </div>

    <script>
      document.getElementById("window-location").innerHTML =
        window.location.origin;

      document
        .getElementById("use-dev-graph")
        .addEventListener("click", () => {
          if (document.getElementById("preference").checked) {
            savePref(window.location.origin, "dev-graph");
          }
          window.location.href = "https://studio.apollographql.com/dev";
        });

      document
        .getElementById("use-playground")
        .addEventListener("click", (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          if (document.getElementById("preference").checked) {
            savePref(window.location.origin, "playground");
          }
          loadPlayground();
        });
    </script>
  </body>
</html>
`;
