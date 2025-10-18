// Example server test
describe("Server Tests", () => {
  it("should pass basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("should verify environment", () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
