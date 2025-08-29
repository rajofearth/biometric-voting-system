import { z } from "zod";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any;
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData?: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData?: FormData): Promise<ActionState> => {
    let data: any;
    
    if (formData) {
      // Handle FormData
      data = Object.fromEntries(formData);
    } else {
      // Handle direct object calls
      data = prevState;
    }
    
    const result = schema.safeParse(data);
    
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    try {
      const actionResult = await action(result.data, formData);
      return { success: "Success", ...actionResult };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "An error occurred" };
    }
  };
}