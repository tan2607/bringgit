import { createClientAsync } from "soap";
import { BaseProvider } from "./base";
import { z } from "zod";

/**
 * Interface for SOAP HTTP client
 */
interface IHttpClient {
  request(
    url: string,
    data: any,
    callback: (error: any, response: any, definition?: string) => void,
    exheaders?: any,
    exoptions?: any,
  ): Promise<any>;
}

/**
 * Schema for WIP state
 */
export const wipStateSchema = z.object({
  BrightreeID: z.number(),
  Description: z.string(),
  IsActive: z.boolean(),
  SortOrder: z.number(),
});

export type WIPState = z.infer<typeof wipStateSchema>;

/**
 * Schema for appointment availability
 */
export const appointmentTimeSchema = z.object({
  time: z.string(),
});

export const appointmentDateSchema = z.object({
  date: z.string(),
  availableTimes: z.array(z.string()),
});

export type AppointmentDate = z.infer<typeof appointmentDateSchema>;

/**
 * Brightree SOAP API client for Reference Data Service operations
 */
export class BrightreeProvider extends BaseProvider {
  private referenceDataClient: any = null;
  private static readonly WSDL_URL = "https://webservices.brightree.net/v0100-2211/ReferenceDataService/ReferenceDataService.svc?wsdl";
  private static readonly PROVIDER_NAME = "Brightree";
  protected static instance: BrightreeProvider;

  protected constructor(private readonly credentials: { username: string; password: string }) {
    super();
  }

  /**
   * Initialize the Brightree provider
   * @param credentials Brightree credentials
   * @returns Promise<BrightreeProvider>
   */
  public static async initialize(credentials: { username: string; password: string }): Promise<BrightreeProvider> {
    try {
      if (!BrightreeProvider.instance) {
        console.log(`[${BrightreeProvider.PROVIDER_NAME}] Initializing provider...`);

        if (!credentials?.username || !credentials?.password) {
          throw new Error(`[${BrightreeProvider.PROVIDER_NAME}] Missing required credentials in runtime config`);
        }

        const instance = new BrightreeProvider(credentials);
        await instance.initializeClient();
        BrightreeProvider.instance = instance;

        console.log(`[${BrightreeProvider.PROVIDER_NAME}] Provider initialized successfully`);
      }
      return BrightreeProvider.instance;
    } catch (error) {
      console.error(`[${BrightreeProvider.PROVIDER_NAME}] Error initializing provider:`, error);
      throw error;
    }
  }


  private async initializeClient(): Promise<any> {
    if (!this.referenceDataClient) {
      try {
        const httpClient: IHttpClient = {
          request: async (
            url: string,
            data: any,
            callback: (error: any, response: any, definition?: string) => void,
            exheaders?: any,
            exoptions?: any,
          ): Promise<any> => {
            try {
              const response = await fetch(url, {
                method: data ? "POST" : "GET",
                body: data,
                headers: new Headers({
                  ...exheaders,
                  "Authorization": `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString("base64")}`,
                  "Content-Type": "text/xml; charset=utf-8",
                  "Accept": "text/xml",
                }),
                ...exoptions,
              });

              const definition = await response.text();
              callback(null, response, definition);
              return response;
            } catch (error) {
              console.error(`[${BrightreeProvider.PROVIDER_NAME}] Error in request:`, error);
              callback(error, null);
              throw error;
            }
          },
        };

        const client = await createClientAsync(BrightreeProvider.WSDL_URL, { httpClient });

        // Add detailed logging for debugging
        client.on("request", (xml) => {
          console.log(`[${BrightreeProvider.PROVIDER_NAME}] SOAP Request:`, {
            timestamp: new Date().toISOString(),
            requestSize: xml.length,
          });
        });

        client.on("response", (response) => {
          console.log(`[${BrightreeProvider.PROVIDER_NAME}] SOAP Response:`, {
            timestamp: new Date().toISOString(),
            responseSize: response.length,
          });
        });

        this.referenceDataClient = client;
        await this.referenceDataClient.describe();
      } catch (error) {
        console.error(
          `[${BrightreeProvider.PROVIDER_NAME}] Error initializing SOAP client:`,
          error,
        );
        throw new Error(
          `[${BrightreeProvider.PROVIDER_NAME}] Failed to initialize SOAP client: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
    return this.referenceDataClient;
  }





  // Relevant WIP State is ID 485: 23 - Scheduling

  /**
   * Fetch WIP states from the Reference Data Service
   * @returns Promise with WIP states
   */
  /**
   * Get the singleton instance of BrightreeProvider
   * @returns Promise<BrightreeProvider>
   */
  public static async getInstance(): Promise<BrightreeProvider> {
    if (!BrightreeProvider.instance) {
      throw new Error(`${BrightreeProvider.PROVIDER_NAME} must be initialized first`);
    }
    return BrightreeProvider.instance as BrightreeProvider;
  }

  /**
   * Fetch WIP states from the Reference Data Service
   * @returns Promise<WIPState[]>
   */
  public async fetchWIPStates(): Promise<WIPState[]> {
    try {
      const [result] = await this.referenceDataClient.PlaceOfServiceFetchAll({});

      return result;
    } catch (error) {
      console.error(`[${BrightreeProvider.PROVIDER_NAME}] Error fetching WIP states:`, error);
      throw new Error(
        `[${BrightreeProvider.PROVIDER_NAME}] Failed to fetch WIP states: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Generate mock appointment availability data for testing
   * @param startDate Optional start date in YYYY-MM-DD format
   * @param endDate Optional end date in YYYY-MM-DD format
   * @returns Array of mock appointment dates with 3 random dates within the next 7 days
   */
  public getMockAppointmentAvailability(
    startDate?: string,
    endDate?: string,
  ): AppointmentDate[] {
    const availabilityData: AppointmentDate[] = [];
    const today = startDate ? new Date(startDate) : new Date();

    // Calculate end date (7 days from start if not provided)
    const endDateTime = endDate ? new Date(endDate) : new Date(today);
    if (!endDate) {
      endDateTime.setDate(today.getDate() + 7);
    }

    // Calculate the range in days
    const dayRange = Math.min(
      Math.floor(
        (endDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      ),
      7, // Cap at 7 days max
    );

    // Format options for date display
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };

    // Generate 3 random dates within the date range (no duplicates)
    const selectedDates = new Set<string>();
    while (selectedDates.size < 3) {
      // Random day offset (0 to dayRange days from today)
      const dayOffset = Math.floor(Math.random() * (dayRange + 1));
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);

      // Format the date as a string (e.g., "Monday, February 26")
      const dateString = date.toLocaleDateString("en-US", dateOptions);
      selectedDates.add(dateString);
    }

    // Convert Set to Array and sort chronologically
    const sortedDates = Array.from(selectedDates).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // For each date, generate multiple time slots
    sortedDates.forEach((dateString) => {
      // Generate 3-5 time slots for each date
      const numSlots = 3 + Math.floor(Math.random() * 3); // 3-5 slots
      const availableTimes: string[] = [];

      // Keep track of used hours to avoid duplicates
      const usedHours = new Set<number>();

      // Generate random time slots (no duplicates)
      while (availableTimes.length < numSlots) {
        // Business hours: 9 AM to 5 PM (9-17)
        const startHour = 9 + Math.floor(Math.random() * 8); // Random hour between 9-16

        // Skip if this hour is already used
        if (usedHours.has(startHour)) continue;

        // Mark this hour as used
        usedHours.add(startHour);

        // Format the time (e.g. "10:00 AM")
        const timeString = `${startHour > 12 ? startHour - 12 : startHour}:00 ${
          startHour >= 12 ? "PM" : "AM"
        }`;
        availableTimes.push(timeString);
      }

      // Sort times chronologically
      availableTimes.sort((a, b) => {
        const hourA = parseInt(a.split(":")[0]) +
          (a.includes("PM") && !a.startsWith("12") ? 12 : 0);
        const hourB = parseInt(b.split(":")[0]) +
          (b.includes("PM") && !b.startsWith("12") ? 12 : 0);
        return hourA - hourB;
      });

      // Add to availability data
      availabilityData.push({
        date: dateString,
        availableTimes,
      });
    });

    return availabilityData;
  }
}
