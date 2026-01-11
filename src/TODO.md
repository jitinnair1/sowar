# Pre-public checklist

- Clean up all source code files
- ~~Why is the JS file 40 MBs? How do I get it to be a reasonable size?~~
- Review the architecture of the `CompilerResult` based design? Does error reporting work as expected?
- Build it on Ubuntu to check if the build is now consistent?
- Remove all debug logs
- ~~Add GH actions to build and deploy~~
- ~~Remove Tailwind CDN~~
- Remove regex parsing for markdown exercies descriptions
- Streamline `index.html` for better UX as needed?
  - Split Run and Submit buttons
  - Add a progress bar maybe?
  - Remove shading from Run button
  - Add a light theme (argh!)
- Add a code trim functionality in `evalOcaml()`
- ~~Add a favicon~~
- Add a README

# Later
- Remove confetti and other deps which can be added implemented easily
- Should the rerender on submit/navigating between exerices be refactored? Can this be done without using a complicated framework?
- What happens to existing completion status if the exercies numbers change? Should the version history be mainted?
- Check for formatting issues with longer programs?
- For C binding of the FFTW implemetation project, would addional libraries be required? How will the logistics of this work?
