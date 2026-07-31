import type { Metadata } from "next";
import "./globals.css";
import { DialectProvider } from "@/context/DialectContext";
import { WalletProvider } from "@/context/WalletContext";
import { LocationProvider } from "@/context/LocationContext";
import { IdentityProvider } from "@/context/IdentityContext";
import { JobsProvider } from "@/context/JobsContext";
import { TeachingHubProvider } from "@/context/TeachingHubContext";
import { PriceTransparencyProvider } from "@/context/PriceTransparencyContext";
import { OpportunityEngineProvider } from "@/context/OpportunityEngineContext";
import { TalentEngineProvider } from "@/context/TalentEngineContext";
import { DiasporaEngineProvider } from "@/context/DiasporaEngineContext";
import { ReputationProvider } from "@/context/ReputationContext";
import { InnovationEngineProvider } from "@/context/InnovationEngineContext";

export const metadata: Metadata = {
  title: "EKIRO — The Digital Intelligence Infrastructure of Ekiti State",
  description:
    "EKIRO connects every citizen, business, institution, and diaspora member of Ekiti State into one intelligent ecosystem — identity, income, skills, transparency, and government data in one platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ekiti-canvas text-ekiti-neutral font-body antialiased">
        <IdentityProvider>
          <LocationProvider>
            <WalletProvider>
              <JobsProvider>
                <TeachingHubProvider>
                  <PriceTransparencyProvider>
                    <OpportunityEngineProvider>
                      <TalentEngineProvider>
                        <DiasporaEngineProvider>
                          <ReputationProvider>
                            <InnovationEngineProvider>
                              <DialectProvider>{children}</DialectProvider>
                            </InnovationEngineProvider>
                          </ReputationProvider>
                        </DiasporaEngineProvider>
                      </TalentEngineProvider>
                    </OpportunityEngineProvider>
                  </PriceTransparencyProvider>
                </TeachingHubProvider>
              </JobsProvider>
            </WalletProvider>
          </LocationProvider>
        </IdentityProvider>
      </body>
    </html>
  );
}
